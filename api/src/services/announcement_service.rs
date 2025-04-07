use crate::db::entities::{announcements, members, teachers};
use crate::models::{AnnouncementView, AppResponse, RoleType, UpsertAnnouncementRequest};
use crate::services::member_service::get_members_name_hashmap;
use crate::util::Claims;
use axum::extract::{Path, State};
use axum::http::StatusCode;
use axum::{Extension, Json};
use chrono::{TimeZone, Utc};
use log::error;
use sea_orm::ActiveValue::Set;
use sea_orm::{
    ActiveModelTrait, ColumnTrait, DatabaseConnection, EntityTrait, QueryFilter, QuerySelect,
};
use uuid::Uuid;

pub async fn add_announcement(
    Extension(claims): Extension<Claims>,
    State(db): State<DatabaseConnection>,
    Json(payload): Json<UpsertAnnouncementRequest>,
) -> Result<Json<AppResponse>, (StatusCode, Json<AppResponse>)> {
    let new_announcement = announcements::ActiveModel {
        id: Default::default(),
        publisher_id: Set(claims.sub.clone()),
        title: Set(payload.title),
        content: Set(payload.content),
        ..Default::default()
    };

    new_announcement.insert(&db).await.map_err(|e| {
        error!("{}", e);
        AppResponse::error(StatusCode::INTERNAL_SERVER_ERROR, "伺服器發生異常")
    })?;

    Ok(AppResponse::success("建立成功"))
}

pub async fn get_announcements(
    State(db): State<DatabaseConnection>,
) -> Result<Json<AppResponse<Vec<AnnouncementView>>>, (StatusCode, Json<AppResponse>)> {
    let announcements = announcements::Entity::find()
        .filter(announcements::Column::DeletedAt.is_null())
        .all(&db)
        .await
        .map_err(|e| {
            error!("{}", e);
            AppResponse::error(StatusCode::INTERNAL_SERVER_ERROR, "伺服器發生異常")
        })?;

    let publisher_ids: Vec<Uuid> = announcements.iter().map(|info| info.publisher_id).collect();

    let member_name_map = get_members_name_hashmap(&db, publisher_ids).await?;

    let result: Vec<AnnouncementView> = announcements
        .into_iter()
        .map(|announcement| AnnouncementView {
            id: announcement.id,
            name: member_name_map
                .get(&announcement.publisher_id)
                .cloned()
                .unwrap_or_else(|| "未知姓名".to_string()),
            title: announcement.title,
            content: announcement.content,
            updated_at: Utc.from_utc_datetime(&announcement.updated_at).into(),
        })
        .collect::<Vec<_>>();

    Ok(AppResponse::success_with_data(result))
}

pub async fn update_announcement(
    Extension(claims): Extension<Claims>,
    State(db): State<DatabaseConnection>,
    Path(announcement_id): Path<Uuid>,
    Json(payload): Json<UpsertAnnouncementRequest>,
) -> Result<Json<AppResponse<AnnouncementView>>, (StatusCode, Json<AppResponse>)> {
    if let Some(announcement) = find_announcement_by_id(&db, announcement_id).await? {
        check_permission(claims.sub, announcement.publisher_id, claims.role)?;

        let mut announcement: announcements::ActiveModel = announcement.into();
        announcement.title = Set(payload.title);
        announcement.content = Set(payload.content);
        announcement.updated_at = Set(Utc::now().naive_utc());

        let announcement: announcements::Model = announcement
            .update(&db)
            .await
            .map_err(|_| AppResponse::error(StatusCode::INTERNAL_SERVER_ERROR, "更新失敗"))?;

        let name = teachers::Entity::find()
            .filter(members::Column::Id.eq(announcement.publisher_id))
            .select_only()
            .column(members::Column::Name)
            .into_tuple::<String>()
            .one(&db)
            .await
            .map_err(|_| AppResponse::error(StatusCode::INTERNAL_SERVER_ERROR, "查詢教師失敗"))?
            .ok_or_else(|| AppResponse::error(StatusCode::BAD_REQUEST, "找不到對應的教師"))?;

        let announcement_view = AnnouncementView {
            id: announcement.id,
            name,
            title: announcement.title,
            content: announcement.content,
            updated_at: Utc.from_utc_datetime(&announcement.updated_at).into(),
        };

        return Ok(AppResponse::success_with_data(announcement_view));
    }

    Err(AppResponse::error(
        StatusCode::BAD_REQUEST,
        "找不到對應的教職員",
    ))
}

pub async fn delete_announcement(
    Extension(claims): Extension<Claims>,
    State(db): State<DatabaseConnection>,
    Path(announcement_id): Path<Uuid>,
) -> Result<Json<AppResponse>, (StatusCode, Json<AppResponse>)> {
    if let Some(announcement) = find_announcement_by_id(&db, announcement_id).await? {
        check_permission(claims.sub, announcement.publisher_id, claims.role)?;

        let mut announcement: announcements::ActiveModel = announcement.into();
        announcement.updated_at = Set(Utc::now().naive_utc());
        announcement.deleted_at = Set(Some(Utc::now().naive_utc()));

        announcement
            .update(&db)
            .await
            .map_err(|_| AppResponse::error(StatusCode::INTERNAL_SERVER_ERROR, "刪除失敗"))?;

        Ok(AppResponse::success("刪除成功"))
    } else {
        Err(AppResponse::error(
            StatusCode::BAD_REQUEST,
            "找不到對應的公告欄",
        ))
    }
}

async fn find_announcement_by_id(
    db: &DatabaseConnection,
    announcement_id: Uuid,
) -> Result<Option<announcements::Model>, (StatusCode, Json<AppResponse>)> {
    announcements::Entity::find()
        .filter(announcements::Column::Id.eq(announcement_id))
        .filter(announcements::Column::DeletedAt.is_null())
        .one(db)
        .await
        .map_err(|e| {
            error!("{}", e);
            AppResponse::error(StatusCode::INTERNAL_SERVER_ERROR, "伺服器發生異常")
        })
}

fn check_permission(
    source_id: Uuid,
    target_id: Uuid,
    role_type: RoleType,
) -> Result<(), (StatusCode, Json<AppResponse>)> {
    if role_type.eq(&RoleType::SuperAdmin) || source_id.eq(&target_id) {
        return Ok(());
    }

    Err(AppResponse::error(
        StatusCode::FORBIDDEN,
        "只有本人或是超級管理員能修改公告",
    ))
}
