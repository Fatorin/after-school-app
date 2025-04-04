use crate::db::entities::students;
use chrono::{TimeZone, Utc};
use sea_orm::prelude::{DateTime, DateTimeWithTimeZone};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use validator::Validate;

#[derive(Debug, Deserialize, Validate)]
pub struct UpsertStudentRequest {
    #[validate(length(min = 2, message = "名稱至少需要2個字元"))]
    pub name: String,
    pub gender: Option<i16>,
    #[validate(length(min = 10, message = "身份證格式不正確"))]
    pub id_number: String,
    pub date_of_birth: Option<DateTime>,
    pub school_name: Option<String>,
    pub grade: Option<i16>,
    pub is_pg: Option<bool>,
    pub description: Option<String>,
    pub family_type: Option<String>,
    pub family_members: Option<i16>,
    pub breadwinner: Option<String>,
    pub occupation: Option<String>,
    pub subsidy: Option<String>,
    pub address: Option<String>,
    pub home_ownership: Option<i16>,
    pub home_phone_number: Option<String>,
    pub mobile_phone_number: Option<String>,
    pub chinese_book: Option<String>,
    pub english_book: Option<String>,
    pub math_book: Option<String>,
    pub science_book: Option<String>,
    pub social_studies_book: Option<String>,
    pub line_id: Option<String>,
    pub comment: Option<String>,
    pub joined_at: DateTimeWithTimeZone,
}

#[derive(Debug, Serialize)]
pub struct StudentView {
    pub id: Uuid,
    pub name: String,
    pub gender: Option<i16>,
    pub id_number: String,
    pub date_of_birth: Option<DateTime>,
    pub school_name: Option<String>,
    pub grade: Option<i16>,
    pub is_pg: Option<bool>,
    pub description: Option<String>,
    pub family_type: Option<String>,
    pub family_members: Option<i16>,
    pub breadwinner: Option<String>,
    pub occupation: Option<String>,
    pub subsidy: Option<String>,
    pub address: Option<String>,
    pub home_ownership: Option<i16>,
    pub home_phone_number: Option<String>,
    pub mobile_phone_number: Option<String>,
    pub line_id: Option<String>,
    pub comment: Option<String>,
    pub joined_at: DateTimeWithTimeZone,
}

impl TryFrom<students::Model> for StudentView {
    type Error = String;

    fn try_from(student: students::Model) -> Result<Self, Self::Error> {
        Ok(StudentView {
            id: student.id,
            name: student.name,
            gender: student.gender,
            id_number: student.id_number,
            date_of_birth: student.date_of_birth,
            school_name: student.school_name,
            grade: student.grade,
            is_pg: student.is_pg,
            description: student.description,
            family_type: student.family_type,
            family_members: student.family_members,
            breadwinner: student.breadwinner,
            occupation: student.occupation,
            subsidy: student.subsidy,
            address: student.address,
            home_ownership: student.home_ownership,
            home_phone_number: student.home_phone_number,
            mobile_phone_number: student.mobile_phone_number,
            line_id: student.line_id,
            comment: student.comment,
            joined_at: Utc.from_utc_datetime(&student.joined_at).into(),
        })
    }
}

#[derive(Debug, Serialize)]
pub struct StudentInfo {
    pub id: Uuid,
    pub name: String,
}
