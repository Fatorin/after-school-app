use crate::db::entities::teachers;
use crate::models::{AppResponse, LoginRequest, MeResponse, RoleType};
use crate::util::{create_token, Claims};
use axum::extract::State;
use axum::http::StatusCode;
use axum::{Extension, Json};
use bcrypt::verify;
use chrono::{Duration, Utc};
use sea_orm::{ColumnTrait, DatabaseConnection, EntityTrait, QueryFilter};
use tower_cookies::cookie::time::OffsetDateTime;
use tower_cookies::{Cookie, Cookies};
use tracing::error;

pub async fn login_handler(
    cookies: Cookies,
    State(db): State<DatabaseConnection>,
    Json(payload): Json<LoginRequest>,
) -> Result<Json<AppResponse>, (StatusCode, Json<AppResponse>)> {
    let teacher = teachers::Entity::find()
        .filter(teachers::Column::Username.eq(payload.username))
        .filter(teachers::Column::DeletedAt.is_null())
        .one(&db)
        .await
        .map_err(|_| AppResponse::error(StatusCode::INTERNAL_SERVER_ERROR, "伺服器發生異常"))?;

    if let Some(teacher) = teacher {
        let is_valid = verify(&payload.password, &teacher.password)
            .map_err(|_| AppResponse::error(StatusCode::INTERNAL_SERVER_ERROR, "伺服器發生異常"))?;

        if is_valid {
            let token = create_token(teacher.id, RoleType::try_from(teacher.role_type).unwrap())
                .map_err(|status_code| AppResponse::error(status_code, "伺服器發生異常"))?;

            let mut cookie = Cookie::new("auth_token", token);
            cookie.set_http_only(true);
            cookie.set_secure(true);
            cookie.set_same_site(tower_cookies::cookie::SameSite::Strict);
            cookie.set_path("/");

            cookies.add(cookie);

            return Ok(AppResponse::success("登入成功"));
        }
    }

    Err(AppResponse::error(
        StatusCode::BAD_REQUEST,
        "使用者名稱或密碼錯誤",
    ))
}

pub async fn me_handler(
    Extension(claims): Extension<Claims>,
    State(db): State<DatabaseConnection>,
) -> Result<Json<AppResponse<MeResponse>>, (StatusCode, Json<AppResponse>)> {
    let teacher = teachers::Entity::find()
        .filter(teachers::Column::Id.eq(claims.sub))
        .filter(teachers::Column::DeletedAt.is_null())
        .one(&db)
        .await
        .map_err(|e| {
            error!("Something is wrong:{}", e);
            AppResponse::error(StatusCode::INTERNAL_SERVER_ERROR, "伺服器發生異常")
        })?;

    if let Some(teacher) = teacher {
        let resp = MeResponse::new(
            teacher.id,
            teacher.username,
            teacher.name,
            RoleType::try_from(teacher.role_type).unwrap(),
            claims.exp,
        );

        Ok(AppResponse::success_with_data(resp))
    } else {
        Err(AppResponse::error(
            StatusCode::UNAUTHORIZED,
            "請檢查登入是否成功",
        ))
    }
}

pub async fn logout_handler(
    cookies: Cookies,
) -> Result<Json<AppResponse>, (StatusCode, Json<AppResponse>)> {
    if let Some(_cookie) = cookies.get("auth_token") {
        let mut removal_cookie = Cookie::new("auth_token", "");
        let expiration_time = (Utc::now() - Duration::days(1)).timestamp();
        removal_cookie.set_expires(OffsetDateTime::from_unix_timestamp(expiration_time).unwrap());
        removal_cookie.set_http_only(true);
        removal_cookie.set_secure(true);
        removal_cookie.set_same_site(tower_cookies::cookie::SameSite::Strict);
        removal_cookie.set_path("/");

        cookies.add(removal_cookie);
    }

    Ok(AppResponse::success("登出成功"))
}
