// #[derive(Debug, Deserialize, Validate)]
// pub struct StudentGradeDto {
//     pub student_id: Uuid,
//     pub academic_year: i16,
//     pub semester: i16,
//     pub exam_type: i16,
//     pub chinese_score: Option<i16>,
//     pub english_score: Option<i16>,
//     pub math_score: Option<i16>,
//     pub science_score: Option<i16>,
//     pub social_studies_score: Option<i16>,
//     pub comment: Option<String>,
// }
//
// #[derive(Debug, Deserialize, Validate)]
// pub struct UpsertStudentGradeRequest {
//     #[serde(flatten)]
//     pub student_grade_dto: StudentGradeDto,
// }
//
// #[derive(Debug, Serialize)]
// pub struct StudentGradeView {
//     pub id: Uuid,
//     pub name: String,
//     #[serde(flatten)]
//     pub student_grade_dto: StudentGradeDto,
//     pub updated_at: DateTimeWithTimeZone,
// }


// pub chinese_book: Option<String>,
// pub english_book: Option<String>,
// pub math_book: Option<String>,
// pub science_book: Option<String>,
// pub social_studies_book: Option<String>,