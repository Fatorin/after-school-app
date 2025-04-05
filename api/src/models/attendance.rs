use sea_orm::prelude::DateTimeWithTimeZone;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Deserialize)]
pub struct UpsertAttendanceRequest {
    pub note: Option<String>,
    pub attendance_students: Vec<AttendanceStudent>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AttendanceStudent {
    pub student_id: Uuid,
    pub attendance_status: bool,
    pub note: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct AttendanceView {
    pub id: String,
    pub note: Option<String>,
    pub created_at: DateTimeWithTimeZone,
    pub updated_at: DateTimeWithTimeZone,
    pub attendance_students: Vec<AttendanceStudent>,
}

#[derive(Debug, Deserialize)]
pub struct AttendanceQuery {
    pub date: String,
}
