use crate::db::entities::student_grades;
use chrono::{TimeZone, Utc};
use sea_orm::prelude::DateTimeWithTimeZone;
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use validator::Validate;

#[derive(Debug, Deserialize, Validate)]
pub struct UpsertStudentGradeRequest {
    pub student_id: Uuid,
    pub academic_year: i16,
    pub semester: i16,
    pub exam_type: i16,
    pub chinese_score: Option<i16>,
    pub english_score: Option<i16>,
    pub math_score: Option<i16>,
    pub science_score: Option<i16>,
    pub social_studies_score: Option<i16>,
    pub comment: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct StudentGradeView {
    pub id: Uuid,
    pub student_id: Uuid,
    pub name: String,
    pub academic_year: i16,
    pub semester: i16,
    pub exam_type: i16,
    pub chinese_score: Option<i16>,
    pub english_score: Option<i16>,
    pub math_score: Option<i16>,
    pub science_score: Option<i16>,
    pub social_studies_score: Option<i16>,
    pub comment: Option<String>,
    pub updated_at: DateTimeWithTimeZone,
}

impl TryFrom<(student_grades::Model, String)> for StudentGradeView {
    type Error = String;

    fn try_from(
        (student_grade, student_name): (student_grades::Model, String),
    ) -> Result<Self, Self::Error> {
        Ok(StudentGradeView {
            id: student_grade.id,
            student_id: student_grade.student_id,
            name: student_name,
            academic_year: student_grade.academic_year,
            semester: student_grade.semester,
            exam_type: student_grade.exam_type,
            chinese_score: student_grade.chinese_score,
            english_score: student_grade.english_score,
            math_score: student_grade.math_score,
            science_score: student_grade.science_score,
            social_studies_score: student_grade.social_studies_score,
            comment: None,
            updated_at: Utc.from_utc_datetime(&student_grade.updated_at).into(),
        })
    }
}
