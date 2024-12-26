use crate::db::entities::announcements;
use chrono::{TimeZone, Utc};
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
    pub teacher_name: String,
    pub title: String,
    pub content: String,
    pub updated_at: DateTimeWithTimeZone,
}

impl TryFrom<(announcements::Model, String)> for AnnouncementView {
    type Error = String;

    fn try_from(
        (model, teacher_name): (announcements::Model, String),
    ) -> Result<Self, Self::Error> {
        Ok(AnnouncementView {
            id: model.id,
            teacher_name,
            title: model.title,
            content: model.content,
            updated_at: Utc.from_utc_datetime(&model.updated_at).into(),
        })
    }
}
