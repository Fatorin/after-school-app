use crate::db::entities::{announcements, teachers};
use crate::models::{AnnouncementView, AppResponse, RoleType, UpsertAnnouncementRequest};
use crate::util::Claims;
use axum::extract::{Path, State};
use axum::http::StatusCode;
use axum::{Extension, Json};
use chrono::Utc;
use sea_orm::ActiveValue::Set;
use sea_orm::{
    ActiveModelTrait, ColumnTrait, DatabaseConnection, EntityTrait, JoinType, QueryFilter,
    QuerySelect, RelationTrait,
};
use uuid::Uuid;

pub async fn add_announcement(
    Extension(claims): Extension<Claims>,
    State(db): State<DatabaseConnection>,
    Json(payload): Json<UpsertAnnouncementRequest>,
) -> Result<Json<AppResponse>, (StatusCode, Json<AppResponse>)> {
    let new_announcement = announcements::ActiveModel {
        id: Default::default(),
        teacher_id: Set(claims.sub.clone()),
        title: Set(payload.title),
        content: Set(payload.content),
        ..Default::default()
    };

    new_announcement
        .insert(&db)
        .await
        .map_err(|_| AppResponse::error(StatusCode::INTERNAL_SERVER_ERROR, "伺服器發生異常"))?;

    Ok(AppResponse::success("建立成功"))
}

pub async fn get_announcements(
    State(db): State<DatabaseConnection>,
) -> Result<Json<AppResponse<Vec<AnnouncementView>>>, (StatusCode, Json<AppResponse>)> {
    let announcements = announcements::Entity::find()
        .join(JoinType::InnerJoin, announcements::Relation::Teachers.def())
        .select_also(teachers::Entity)
        .filter(announcements::Column::DeletedAt.is_null())
        .all(&db)
        .await
        .map_err(|_| AppResponse::error(StatusCode::INTERNAL_SERVER_ERROR, "資料庫異常"))?;

    let result: Vec<AnnouncementView> = announcements
        .into_iter()
        .map(|(announcement, teacher)| {
            AnnouncementView::try_from((announcement, teacher.unwrap().name))
        })
        .collect::<Result<_, _>>()
        .map_err(|_| AppResponse::error(StatusCode::INTERNAL_SERVER_ERROR, "資料轉換出現異常"))?;

    Ok(AppResponse::success_with_data(result))
}

pub async fn update_announcement(
    Extension(claims): Extension<Claims>,
    State(db): State<DatabaseConnection>,
    Path(announcement_id): Path<Uuid>,
    Json(payload): Json<UpsertAnnouncementRequest>,
) -> Result<Json<AppResponse<AnnouncementView>>, (StatusCode, Json<AppResponse>)> {
    if let Some(announcement) = find_announcement_by_id(&db, announcement_id).await? {
        check_permission(claims.sub, announcement.teacher_id, claims.role)?;

        let mut announcement: announcements::ActiveModel = announcement.into();
        announcement.title = Set(payload.title);
        announcement.content = Set(payload.content);
        announcement.updated_at = Set(Utc::now().naive_utc());

        let announcement: announcements::Model = announcement
            .update(&db)
            .await
            .map_err(|_| AppResponse::error(StatusCode::INTERNAL_SERVER_ERROR, "更新失敗"))?;

        let teacher_name = teachers::Entity::find()
            .filter(teachers::Column::Id.eq(announcement.teacher_id))
            .select_only()
            .column(teachers::Column::Name)
            .into_tuple::<String>() // 改用 into_tuple
            .one(&db)
            .await
            .map_err(|_| AppResponse::error(StatusCode::INTERNAL_SERVER_ERROR, "查詢教師失敗"))?
            .ok_or_else(|| AppResponse::error(StatusCode::BAD_REQUEST, "找不到對應的教師"))?;

        let announcement_view =
            AnnouncementView::try_from((announcement, teacher_name)).map_err(|_| {
                AppResponse::error(StatusCode::INTERNAL_SERVER_ERROR, "資料轉換出現異常")
            })?;

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
        check_permission(claims.sub, announcement.teacher_id, claims.role)?;

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
        .map_err(|_| AppResponse::error(StatusCode::INTERNAL_SERVER_ERROR, "資料庫異常"))
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
