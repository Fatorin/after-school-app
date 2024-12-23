use axum::http::StatusCode;
use axum::Json;
use serde::Serialize;

#[derive(Serialize)]
pub struct AppResponse<T = ()>
where
    T: Serialize,
{
    pub message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub data: Option<T>,
}

impl<T> AppResponse<T>
where
    T: Serialize,
{
    pub fn success_with_data(data: T) -> Json<Self> {
        Json(Self {
            message: String::from("OK"),
            data: Some(data),
        })
    }
}

impl AppResponse<()> {
    pub fn success(message: impl Into<String>) -> Json<Self> {
        Json(Self {
            message: message.into(),
            data: None,
        })
    }

    pub fn error(status: StatusCode, message: impl Into<String>) -> (StatusCode, Json<Self>) {
        (
            status,
            Json(Self {
                message: message.into(),
                data: None,
            }),
        )
    }
}