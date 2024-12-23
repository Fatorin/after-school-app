use crate::db::entities::teachers;
use chrono::{TimeZone, Utc};
use sea_orm::prelude::DateTimeWithTimeZone;
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use validator::Validate;

#[derive(Debug, Deserialize, Validate)]
pub struct UpsertTeacherRequest {
    pub employment_type: EmploymentType,
    #[validate(length(min = 4, message = "使用者名稱至少需要4個字元"))]
    pub username: Option<String>,
    #[validate(length(min = 8, message = "密碼至少需要8個字元"))]
    pub password: Option<String>,
    #[validate(length(min = 2, message = "名稱至少需要2個字元"))]
    pub name: String,
    pub phone: Option<String>,
    pub responsibility: Option<String>,
    pub background: Option<String>,
    pub id_number: Option<String>,
    pub date_of_birth: Option<DateTimeWithTimeZone>,
}

#[derive(Debug, Serialize)]
pub struct TeacherView {
    pub id: Uuid,
    pub username: String,
    pub role_type: RoleType,
    pub employment_type: i16,
    pub name: String,
    pub phone: Option<String>,
    pub responsibility: Option<String>,
    pub background: Option<String>,
    pub id_number: Option<String>,
    pub date_of_birth: Option<DateTimeWithTimeZone>,
}

impl TryFrom<teachers::Model> for TeacherView {
    type Error = String;

    fn try_from(teacher: teachers::Model) -> Result<Self, Self::Error> {
        Ok(TeacherView {
            id: teacher.id,
            username: teacher.username,
            role_type: RoleType::try_from(teacher.role_type).map_err(|e| e.to_string())?,
            employment_type: teacher.employment_type,
            name: teacher.name,
            phone: teacher.phone,
            responsibility: teacher.responsibility,
            background: teacher.background,
            id_number: teacher.id_number,
            date_of_birth: teacher
                .date_of_birth
                .map(|dt| Utc.from_utc_datetime(&dt).into()),
        })
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum RoleType {
    SuperAdmin,
    Admin,
}

impl TryFrom<i16> for RoleType {
    type Error = &'static str;

    fn try_from(value: i16) -> Result<Self, Self::Error> {
        match value {
            0 => Ok(RoleType::SuperAdmin),
            1 => Ok(RoleType::Admin),
            _ => Err("無效值"),
        }
    }
}

impl From<RoleType> for i16 {
    fn from(role: RoleType) -> i16 {
        match role {
            RoleType::SuperAdmin => 0,
            RoleType::Admin => 1,
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
#[serde(from = "i16")]
pub enum EmploymentType {
    FullTime = 0,
    HalfTime = 1,
    Volunteer = 2,
}

impl From<i16> for EmploymentType {
    fn from(value: i16) -> Self {
        match value {
            0 => EmploymentType::FullTime,
            1 => EmploymentType::HalfTime,
            2 => EmploymentType::Volunteer,
            _ => EmploymentType::Volunteer,
        }
    }
}

impl From<EmploymentType> for i16 {
    fn from(role: EmploymentType) -> i16 {
        match role {
            EmploymentType::FullTime => 0,
            EmploymentType::HalfTime => 1,
            EmploymentType::Volunteer => 2,
        }
    }
}
