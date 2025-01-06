use crate::config::CONFIG;
use crate::services::{add_announcement, add_attendance_record, add_grades, add_student, add_teacher, delete_announcement, delete_grades, delete_student, delete_teacher, get_announcements, get_attendance_record, get_grades, get_students, get_teachers, login_handler, logout_handler, me_handler, update_announcement, update_attendance, update_grades, update_student, update_teacher};
use crate::util;
use axum::body::Body;
use axum::http::{header, HeaderValue, Method, Request, StatusCode};
use axum::routing::{get, post, put};
use axum::{middleware, middleware::Next, response::Response, Router};
use log::info;
use sea_orm::DatabaseConnection;
use tower_cookies::CookieManagerLayer;
use tower_http::cors::CorsLayer;
use tower_http::trace::TraceLayer;

pub fn new_route(db: DatabaseConnection) -> Router {
    let cors = CorsLayer::new()
        .allow_origin(CONFIG.server.cors.parse::<HeaderValue>().unwrap())
        .allow_methods([
            Method::GET,
            Method::POST,
            Method::PUT,
            Method::DELETE,
            Method::OPTIONS,
        ])
        .allow_credentials(true)
        .allow_headers([header::CONTENT_TYPE, header::AUTHORIZATION, header::ACCEPT]);

    let protected_routes = Router::new()
        .route("/me", get(me_handler))
        .route("/teachers", get(get_teachers).post(add_teacher))
        .route("/teachers/{id}", put(update_teacher).delete(delete_teacher))
        .route("/students", get(get_students).post(add_student))
        .route("/students/{id}", put(update_student).delete(delete_student))
        .route("/grades", get(get_grades).post(add_grades))
        .route("/grades/{id}", put(update_grades).delete(delete_grades))
        .route(
            "/announcements",
            get(get_announcements).post(add_announcement),
        )
        .route(
            "/announcements/{id}",
            put(update_announcement).delete(delete_announcement),
        )
        .route("/attendance-records", get(get_attendance_record))
        .route(
            "/attendance-records/{id}",
            post(add_attendance_record).put(update_attendance),
        )
        .layer(middleware::from_fn(auth_middleware));

    Router::new()
        .route("/api/login", post(login_handler))
        .route("/api/logout", post(logout_handler))
        .nest("/api", protected_routes)
        .layer(CookieManagerLayer::new())
        .layer(cors)
        .layer(TraceLayer::new_for_http())
        .layer(middleware::from_fn(log_request))
        .with_state(db)
}

async fn auth_middleware(mut req: Request<Body>, next: Next) -> Result<Response, StatusCode> {
    let cookies = req
        .headers()
        .get(header::COOKIE)
        .ok_or(StatusCode::UNAUTHORIZED)?
        .to_str()
        .map_err(|_| StatusCode::UNAUTHORIZED)?;

    let token_cookie = cookies
        .split(';')
        .find_map(|cookie| {
            let cookie = cookie.trim();
            if cookie.starts_with("auth_token=") {
                Some(cookie.trim_start_matches("auth_token=").to_string())
            } else {
                None
            }
        })
        .ok_or(StatusCode::UNAUTHORIZED)?;

    let token_data = util::decode_token(&token_cookie)?;
    req.extensions_mut().insert(token_data.claims);
    Ok(next.run(req).await)
}

async fn log_request(req: Request<Body>, next: Next) -> Response {
    let start = std::time::Instant::now();
    let method = req.method().clone();
    let uri = req.uri().clone();

    info!("收到請求: {} {}", method, uri);

    let response = next.run(req).await;

    let duration = start.elapsed();
    info!(
        "請求完成: {} {} - 狀態碼: {} - 處理時間: {:?}",
        method,
        uri,
        response.status(),
        duration
    );

    response
}
