use crate::db::entities::{members, teachers};
use crate::models::MemberDto;
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use validator::Validate;

#[derive(Debug, Serialize, Deserialize, Validate)]
pub struct AddTeacherRequest {
    pub member_id: Option<Uuid>,
    #[validate(length(min = 4, message = "使用者名稱至少需要4個字元"))]
    pub username: String,
    #[validate(length(min = 8, message = "密碼至少需要8個字元"))]
    pub password: String,
    pub employment_type: EmploymentType,
    pub responsibility: Option<String>,
    pub background: Option<String>,
    #[serde(flatten)]
    pub member_dto: MemberDto,
}

#[derive(Debug, Deserialize, Validate)]
pub struct UpdateTeacherRequest {
    #[validate(length(min = 8, message = "密碼至少需要8個字元"))]
    pub password: Option<String>,
    pub employment_type: EmploymentType,
    pub responsibility: Option<String>,
    pub background: Option<String>,
    #[serde(flatten)]
    pub member_dto: MemberDto,
}

#[derive(Debug, Serialize)]
pub struct TeacherView {
    pub member_id: Uuid,
    pub username: String,
    pub employment_type: EmploymentType,
    pub responsibility: Option<String>,
    pub background: Option<String>,
    #[serde(flatten)]
    pub member_dto: MemberDto,
}

pub fn teacher_and_member_to_view(teacher: teachers::Model, member: members::Model) -> TeacherView {
    let member_id = member.id;
    let member_dto = MemberDto::from(member);
    TeacherView {
        member_id,
        username: teacher.username,
        employment_type: EmploymentType::from(teacher.employment_type),
        responsibility: teacher.responsibility,
        background: teacher.background,
        member_dto,
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
