use sea_orm::prelude::DateTimeWithTimeZone;
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use validator::Validate;

#[derive(Debug, Deserialize, Validate)]
pub struct UpsertAnnouncementRequest {
    pub title: String,
    pub content: String,
}

#[derive(Debug, Serialize)]
pub struct AnnouncementView {
    pub id: Uuid,
    pub name: String,
    pub title: String,
    pub content: String,
    pub updated_at: DateTimeWithTimeZone,
}