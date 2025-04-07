use crate::db::entities::members;
use crate::models::{AppResponse, MemberDto, MemberView, UpsertMemberRequest};
use axum::extract::{Path, State};
use axum::http::StatusCode;
use axum::Json;
use chrono::Utc;
use log::error;
use sea_orm::ActiveValue::Set;
use sea_orm::{
    ActiveModelTrait, ColumnTrait, ConnectionTrait, DatabaseConnection, EntityTrait, QueryFilter,
};
use uuid::Uuid;
use validator::Validate;

pub async fn get_members(
    State(db): State<DatabaseConnection>,
) -> Result<Json<AppResponse<Vec<MemberView>>>, (StatusCode, Json<AppResponse>)> {
    let members = members::Entity::find().all(&db).await.map_err(|e| {
        error!("{}", e);
        AppResponse::error(StatusCode::INTERNAL_SERVER_ERROR, "資料庫異常")
    })?;

    let mut result = vec![];
    for member in members {
        let member_view = MemberView {
            member_dto: MemberDto::from(member),
        };
        result.push(member_view);
    }

    Ok(AppResponse::success_with_data(result))
}

pub async fn add_member(
    State(db): State<DatabaseConnection>,
    Json(payload): Json<UpsertMemberRequest>,
) -> Result<Json<AppResponse>, (StatusCode, Json<AppResponse>)> {
    if let Err(err) = payload.validate() {
        return Err(AppResponse::error(
            StatusCode::BAD_REQUEST,
            format!("參數不正確。錯誤參數：{}", err),
        ));
    }

    if let Some(id_number) = &payload.member_dto.id_number {
        if find_member_by_id_number(&db, id_number).await?.is_some() {
            return Err(AppResponse::error(
                StatusCode::BAD_REQUEST,
                "此身份證字號已被使用",
            ));
        };
    }

    let new_member = members::ActiveModel {
        id: Default::default(),
        name: Set(payload.member_dto.name),
        gender: Set(payload.member_dto.gender),
        id_number: Set(payload.member_dto.id_number),
        birth_date: Set(payload.member_dto.birth_date.map(|d| d.naive_utc().into())),
        home_phone_number: Set(payload.member_dto.home_phone_number),
        mobile_phone_number: Set(payload.member_dto.mobile_phone_number),
        address: Set(payload.member_dto.address),
        title: Set(payload.member_dto.title),
        line_id: Set(payload.member_dto.line_id),
        joined_at: Set(payload.member_dto.joined_at.naive_utc()),
        created_at: Set(Utc::now().naive_utc()),
        updated_at: Set(Utc::now().naive_utc()),
        ..Default::default()
    };

    new_member.insert(&db).await.map_err(|e| {
        error!("{}", e);
        AppResponse::error(StatusCode::INTERNAL_SERVER_ERROR, "伺服器發生異常")
    })?;

    Ok(AppResponse::success("建立成功"))
}

pub async fn update_member(
    State(db): State<DatabaseConnection>,
    Path(member_id): Path<Uuid>,
    Json(payload): Json<UpsertMemberRequest>,
) -> Result<Json<AppResponse<MemberView>>, (StatusCode, Json<AppResponse>)> {
    if let Err(err) = payload.member_dto.validate() {
        return Err(AppResponse::error(
            StatusCode::BAD_REQUEST,
            format!("參數不正確。錯誤參數：{}", err),
        ));
    }

    let member = upsert_member_with_context(&db, member_id, payload.member_dto).await?;

    let member_view = MemberView {
        member_dto: MemberDto::from(member),
    };

    Ok(AppResponse::success_with_data(member_view))
}

pub(crate) async fn find_member_by_id<C>(
    db: &C,
    id: Uuid,
) -> Result<Option<members::Model>, (StatusCode, Json<AppResponse>)>
where
    C: ConnectionTrait,
{
    members::Entity::find()
        .filter(members::Column::Id.eq(id))
        .one(db)
        .await
        .map_err(|e| {
            error!("find_member_by_id error:{}", e);
            AppResponse::error(StatusCode::INTERNAL_SERVER_ERROR, "資料庫異常")
        })
}

pub(crate) async fn find_member_by_id_number(
    db: &DatabaseConnection,
    id_number: &str,
) -> Result<Option<members::Model>, (StatusCode, Json<AppResponse>)> {
    members::Entity::find()
        .filter(members::Column::IdNumber.eq(id_number))
        .one(db)
        .await
        .map_err(|e| {
            error!("find_member_by_id_number error:{}", e);
            AppResponse::error(StatusCode::INTERNAL_SERVER_ERROR, "資料庫異常")
        })
}

pub(crate) async fn upsert_member_with_context<C>(
    db: &C,
    member_id: Uuid,
    dto: MemberDto,
) -> Result<members::Model, (StatusCode, Json<AppResponse>)>
where
    C: ConnectionTrait,
{
    let option_member = find_member_by_id(db, member_id).await?;
    match option_member {
        Some(member) => {
            let mut member: members::ActiveModel = member.into();
            member.name = Set(dto.name);
            member.gender = Set(dto.gender);
            member.id_number = Set(dto.id_number);
            member.birth_date = Set(dto.birth_date.map(|d| d.naive_utc().into()));
            member.home_phone_number = Set(dto.home_phone_number);
            member.mobile_phone_number = Set(dto.mobile_phone_number);
            member.address = Set(dto.address);
            member.title = Set(dto.title);
            member.line_id = Set(dto.line_id);
            member.comment = Set(dto.comment);
            member.joined_at = Set(dto.joined_at.naive_utc());
            member.updated_at = Set(Utc::now().naive_utc());

            let result = member.update(db).await.map_err(|e| {
                error!("upsert_member_with_context error:{}", e);
                AppResponse::error(StatusCode::INTERNAL_SERVER_ERROR, "伺服器發生異常")
            })?;

            Ok(result)
        }
        None => {
            let new_member = members::ActiveModel {
                id: Default::default(),
                name: Set(dto.name),
                gender: Set(dto.gender),
                id_number: Set(dto.id_number),
                birth_date: Set(dto.birth_date.map(|d| d.naive_utc().into())),
                home_phone_number: Set(dto.home_phone_number),
                mobile_phone_number: Set(dto.mobile_phone_number),
                address: Set(dto.address),
                title: Set(dto.title),
                line_id: Set(dto.line_id),
                comment: Set(dto.comment),
                joined_at: Set(dto.joined_at.naive_utc()),
                ..Default::default()
            };

            let new_member_result = new_member.insert(db).await.map_err(|e| {
                error!("upsert_member_with_context error:{}", e);
                AppResponse::error(StatusCode::INTERNAL_SERVER_ERROR, "伺服器發生異常")
            })?;

            Ok(new_member_result)
        }
    }
}
