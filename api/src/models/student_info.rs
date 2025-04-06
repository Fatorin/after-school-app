use serde::{Deserialize, Serialize};
use uuid::Uuid;
use validator::Validate;

#[derive(Debug, Serialize, Deserialize, Validate)]
pub struct StudentInfoDto {
    pub academic_year: i16,
    pub chinese_book: Option<String>,
    pub english_book: Option<String>,
    pub math_book: Option<String>,
    pub science_book: Option<String>,
    pub social_studies_book: Option<String>,
    pub comment: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Validate)]
pub struct StudentExamDto {
    pub semester: i16,
    pub exam_type: i16,
    pub chinese_score: Option<i16>,
    pub english_score: Option<i16>,
    pub math_score: Option<i16>,
    pub science_score: Option<i16>,
    pub social_studies_score: Option<i16>,
}

#[derive(Debug, Deserialize, Validate)]
pub struct UpsertStudentInfoRequest {
    #[serde(flatten)]
    pub info_dto: StudentInfoDto,
    pub exams_dto: [StudentExamDto; 2],
}

#[derive(Debug, Serialize)]
pub struct StudentInfoView {
    pub id: Uuid,
    pub name: String,
    #[serde(flatten)]
    pub info_dto: StudentInfoDto,
    pub exams_dto: Vec<StudentExamDto>,
}
