use crate::db::entities::members;
use chrono::{TimeZone, Utc};
use sea_orm::prelude::{DateTime, DateTimeWithTimeZone};
use serde::{Deserialize, Serialize};
use validator::Validate;

#[derive(Debug, Serialize, Deserialize, Validate)]
pub struct MemberDto {
    #[validate(length(min = 2, message = "名稱至少需要2個字元"))]
    pub name: String,
    #[validate(length(min = 10, message = "身份證格式不正確"))]
    pub id_number: Option<String>,
    pub gender: Option<i16>,
    pub birth_date: Option<DateTime>,
    pub home_phone_number: Option<String>,
    pub mobile_phone_number: Option<String>,
    pub address: Option<String>,
    pub title: Option<String>,
    pub line_id: Option<String>,
    pub comment: Option<String>,
    pub joined_at: DateTimeWithTimeZone,
}

#[derive(Debug, Deserialize, Validate)]
pub struct UpsertMemberRequest {
    #[serde(flatten)]
    pub member_dto: MemberDto,
}

#[derive(Debug, Serialize)]
pub struct MemberView {
    #[serde(flatten)]
    pub member_dto: MemberDto,
}

impl From<members::Model> for MemberDto {
    fn from(member: members::Model) -> Self {
        MemberDto {
            name: member.name,
            id_number: member.id_number,
            gender: member.gender,
            birth_date: member.birth_date,
            home_phone_number: member.home_phone_number,
            mobile_phone_number: member.mobile_phone_number,
            address: member.address,
            title: member.title,
            line_id: member.line_id,
            comment: member.comment,
            joined_at: Utc.from_utc_datetime(&member.joined_at).into(),
        }
    }
}
