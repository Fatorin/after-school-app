use crate::db::entities::{members, students};
use crate::models::MemberDto;
use chrono::{TimeZone, Utc};
use sea_orm::prelude::DateTimeWithTimeZone;
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use validator::Validate;

#[derive(Debug, Serialize, Deserialize, Validate)]
pub struct StudentDto {
    pub school_name: Option<String>,
    pub grade: Option<i16>,
    pub is_pg: Option<bool>,
    pub description: Option<String>,
    pub family_type: Option<String>,
    pub family_members: Option<i16>,
    pub breadwinner: Option<String>,
    pub occupation: Option<String>,
    pub subsidy: Option<String>,
    pub home_ownership: Option<i16>,
    pub class_joined_at: DateTimeWithTimeZone,
}

#[derive(Debug, Deserialize, Validate)]
pub struct AddStudentRequest {
    pub member_id: Option<Uuid>,
    #[serde(flatten)]
    pub member_dto: MemberDto,
    #[serde(flatten)]
    pub student_dto: StudentDto,
}

#[derive(Debug, Deserialize, Validate)]
pub struct UpdateStudentRequest {
    #[serde(flatten)]
    pub member_dto: MemberDto,
    #[serde(flatten)]
    pub student_dto: StudentDto,
}

#[derive(Debug, Serialize)]
pub struct StudentView {
    pub member_id: Uuid,
    #[serde(flatten)]
    pub member_dto: MemberDto,
    #[serde(flatten)]
    pub student_dto: StudentDto,
}

pub fn student_and_member_to_view(student: students::Model, member: members::Model) -> StudentView {
    let member_id = member.id;
    let member_dto = MemberDto::from(member);
    let student_dto = StudentDto {
        school_name: student.school_name,
        grade: student.grade,
        is_pg: student.is_pg,
        description: student.description,
        family_type: student.family_type,
        family_members: student.family_members,
        breadwinner: student.breadwinner,
        occupation: student.occupation,
        subsidy: student.subsidy,
        home_ownership: student.home_ownership,
        class_joined_at: Utc.from_utc_datetime(&student.class_joined_at).into(),
    };
    StudentView {
        member_id,
        member_dto,
        student_dto,
    }
}
