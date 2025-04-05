use crate::config::CONFIG;
use crate::models::RoleType;
use axum::http::StatusCode;
use jsonwebtoken::{encode, DecodingKey, EncodingKey, Header, TokenData, Validation};
use sea_orm::sqlx::types::chrono::Utc;
use serde::{Deserialize, Serialize};
use std::time::Duration;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Claims {
    pub sub: Uuid,
    pub role: RoleType,
    pub exp: i64,
}

pub fn create_token(id: Uuid, role: RoleType) -> Result<String, StatusCode> {
    let claims = Claims {
        sub: id,
        role,
        exp: (Utc::now() + Duration::from_secs(24 * 60 * 60)).timestamp(),
    };

    let token = encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(CONFIG.auth.jwt_secret.as_bytes()),
    )
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(token)
}

pub fn decode_token(token: &str) -> Result<TokenData<Claims>, StatusCode> {
    let token_data = jsonwebtoken::decode::<Claims>(
        &token,
        &DecodingKey::from_secret(CONFIG.auth.jwt_secret.as_bytes()),
        &Validation::default(),
    )
    .map_err(|_| StatusCode::UNAUTHORIZED)?;

    Ok(token_data)
}
