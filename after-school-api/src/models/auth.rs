use crate::models::RoleType;
use sea_orm::prelude::Uuid;
use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
pub struct LoginRequest {
    pub username: String,
    pub password: String,
}

#[derive(Serialize)]
pub struct MeResponse {
    id: Uuid,
    username: String,
    name: String,
    role: RoleType,
    exp: i64,
}

impl MeResponse {
    pub fn new(id: Uuid, username: String, name: String, role: RoleType, exp: i64) -> Self {
        Self {
            id,
            username,
            name,
            role,
            exp,
        }
    }
}
