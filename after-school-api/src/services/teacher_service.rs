use crate::db::entities::teachers;
use crate::db::field::update_optional_field;
use crate::models::{AppResponse, EmploymentType, RoleType, TeacherView, UpsertTeacherRequest};
use crate::util::Claims;
use axum::extract::{Path, State};
use axum::http::StatusCode;
use axum::{Extension, Json};
use bcrypt::{hash, DEFAULT_COST};
use chrono::Utc;
use sea_orm::ActiveValue::Set;
use sea_orm::{ActiveModelTrait, ColumnTrait, DatabaseConnection, EntityTrait, QueryFilter};
use tracing::info;
use uuid::Uuid;
use validator::Validate;

pub async fn add_teacher(
    Extension(claims): Extension<Claims>,
    State(db): State<DatabaseConnection>,
    Json(payload): Json<UpsertTeacherRequest>,
) -> Result<Json<AppResponse>, (StatusCode, Json<AppResponse>)> {
    if let Err(err) = payload.validate() {
        return Err(AppResponse::error(
            StatusCode::BAD_REQUEST,
            format!("參數不正確。錯誤參數：{}", err),
        ));
    }

    check_permission(claims.role)?;

    let username = match payload.username {
        Some(username) => username,
        None => {
            info!("Username is required");
            return Err(AppResponse::error(
                StatusCode::BAD_REQUEST,
                "沒有設定用戶名稱",
            ));
        }
    };

    let password = match payload.password {
        Some(password) => password,
        None => {
            return Err(AppResponse::error(StatusCode::BAD_REQUEST, "沒有設定密碼"));
        }
    };

    if teachers::Entity::find()
        .filter(teachers::Column::Username.eq(&username))
        .one(&db)
        .await
        .map_err(|_| AppResponse::error(StatusCode::INTERNAL_SERVER_ERROR, "伺服器發生異常"))?
        .is_some()
    {
        return Err(AppResponse::error(
            StatusCode::BAD_REQUEST,
            "此帳號已被註冊",
        ));
    }

    let password_hash = hash(password, DEFAULT_COST)
        .map_err(|_| AppResponse::error(StatusCode::INTERNAL_SERVER_ERROR, "伺服器發生異常"))?;

    let new_teacher = teachers::ActiveModel {
        id: Default::default(),
        username: Set(username),
        password: Set(password_hash),
        role_type: Set(RoleType::Admin.into()),
        employment_type: Set(EmploymentType::FullTime.into()),
        name: Set(payload.name),
        phone: Set(payload.phone),
        responsibility: Set(payload.responsibility),
        background: Set(payload.background),
        id_number: Set(payload.id_number),
        date_of_birth: Set(payload.date_of_birth.map(|dt| dt.naive_utc())),
        ..Default::default()
    };

    new_teacher
        .insert(&db)
        .await
        .map_err(|_| AppResponse::error(StatusCode::INTERNAL_SERVER_ERROR, "伺服器發生異常"))?;

    Ok(AppResponse::success("建立成功"))
}

pub async fn get_teachers(
    State(db): State<DatabaseConnection>,
) -> Result<Json<AppResponse<Vec<TeacherView>>>, (StatusCode, Json<AppResponse>)> {
    let teachers = teachers::Entity::find()
        .filter(teachers::Column::DeletedAt.is_null())
        .all(&db)
        .await
        .map_err(|_| AppResponse::error(StatusCode::INTERNAL_SERVER_ERROR, "資料庫異常"))?;

    let mut result = vec![];
    for teacher in teachers {
        let teacher_view = TeacherView::try_from(teacher).map_err(|_| {
            AppResponse::error(StatusCode::INTERNAL_SERVER_ERROR, "資料轉換出現異常")
        })?;
        result.push(teacher_view);
    }

    Ok(AppResponse::success_with_data(result))
}

pub async fn update_teacher(
    Extension(claims): Extension<Claims>,
    State(db): State<DatabaseConnection>,
    Path(teacher_id): Path<Uuid>,
    Json(payload): Json<UpsertTeacherRequest>,
) -> Result<Json<AppResponse<TeacherView>>, (StatusCode, Json<AppResponse>)> {
    if let Err(err) = payload.validate() {
        return Err(AppResponse::error(
            StatusCode::BAD_REQUEST,
            format!("參數不正確。錯誤參數：{}", err),
        ));
    }

    if claims.sub != teacher_id || claims.role != RoleType::SuperAdmin {
        return Err(AppResponse::error(
            StatusCode::FORBIDDEN,
            "非本人或是系統管理員，無法修改。",
        ));
    }

    if let Some(teacher) = find_teacher_by_id(&db, teacher_id).await? {
        let mut teacher: teachers::ActiveModel = teacher.into();

        if let Some(password) = payload.password {
            let password_hash = hash(password, DEFAULT_COST).map_err(|_| {
                AppResponse::error(StatusCode::INTERNAL_SERVER_ERROR, "伺服器發生異常")
            })?;
            teacher.password = Set(password_hash);
        }

        teacher.employment_type = Set(payload.employment_type.into());
        teacher.name = Set(payload.name);
        update_optional_field(&mut teacher.phone, payload.phone);
        update_optional_field(&mut teacher.responsibility, payload.responsibility);
        update_optional_field(&mut teacher.background, payload.background);
        update_optional_field(&mut teacher.id_number, payload.id_number);
        update_optional_field(
            &mut teacher.date_of_birth,
            payload.date_of_birth.map(|dt| dt.naive_utc()),
        );
        teacher.updated_at = Set(Utc::now().naive_utc());

        let teacher: teachers::Model = teacher
            .update(&db)
            .await
            .map_err(|_| AppResponse::error(StatusCode::INTERNAL_SERVER_ERROR, "更新失敗"))?;

        let teacher_view = TeacherView::try_from(teacher).map_err(|_| {
            AppResponse::error(StatusCode::INTERNAL_SERVER_ERROR, "資料轉換出現異常")
        })?;

        return Ok(AppResponse::success_with_data(teacher_view));
    }

    Err(AppResponse::error(
        StatusCode::BAD_REQUEST,
        "找不到對應的教職員",
    ))
}

pub async fn delete_teacher(
    Extension(claims): Extension<Claims>,
    State(db): State<DatabaseConnection>,
    Path(teacher_id): Path<Uuid>,
) -> Result<Json<AppResponse>, (StatusCode, Json<AppResponse>)> {
    check_permission(claims.role)?;

    if let Some(teacher) = find_teacher_by_id(&db, teacher_id).await? {
        let mut teacher: teachers::ActiveModel = teacher.into();
        teacher.updated_at = Set(Utc::now().naive_utc());
        teacher.deleted_at = Set(Some(Utc::now().naive_utc()));

        teacher
            .update(&db)
            .await
            .map_err(|_| AppResponse::error(StatusCode::INTERNAL_SERVER_ERROR, "更新失敗"))?;

        Ok(AppResponse::success("刪除成功"))
    } else {
        Err(AppResponse::error(
            StatusCode::BAD_REQUEST,
            "找不到對應的教職員",
        ))
    }
}

async fn find_teacher_by_id(
    db: &DatabaseConnection,
    teacher_id: Uuid,
) -> Result<Option<teachers::Model>, (StatusCode, Json<AppResponse>)> {
    teachers::Entity::find()
        .filter(teachers::Column::Id.eq(teacher_id))
        .filter(teachers::Column::DeletedAt.is_null())
        .one(db)
        .await
        .map_err(|_| AppResponse::error(StatusCode::INTERNAL_SERVER_ERROR, "資料庫異常"))
}

fn check_permission(role_type: RoleType) -> Result<(), (StatusCode, Json<AppResponse>)> {
    if role_type.ne(&RoleType::SuperAdmin) {
        return Err(AppResponse::error(
            StatusCode::FORBIDDEN,
            "主管理員才可使用",
        ));
    }

    Ok(())
}