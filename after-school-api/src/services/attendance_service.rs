use crate::db::entities::{attendance_records, attendance_students};
use crate::models::{
    AppResponse, AttendanceQuery, AttendanceStudent, AttendanceView, UpsertAttendanceRequest,
};
use axum::extract::Query;
use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
};
use chrono::{NaiveDate, TimeZone, Utc};
use sea_orm::{
    ActiveModelTrait, ColumnTrait, ConnectionTrait, DatabaseConnection, EntityTrait, ModelTrait,
    QueryFilter, Set, TransactionTrait,
};

pub async fn get_attendance_record(
    State(db): State<DatabaseConnection>,
    Query(query): Query<AttendanceQuery>,
) -> Result<Json<AppResponse<AttendanceView>>, (StatusCode, Json<AppResponse>)> {
    let record = find_attendance_records_by_id(&db, query.date)
        .await?
        .ok_or_else(|| AppResponse::error(StatusCode::NOT_FOUND, "沒有該日期的簽到表"))?;

    let students = record
        .find_related(attendance_students::Entity)
        .all(&db)
        .await
        .map_err(|_| AppResponse::error(StatusCode::NOT_FOUND, "資料庫異常"))?;

    let response = AttendanceView {
        id: record.id,
        note: record.note,
        created_at: Utc.from_utc_datetime(&record.created_at).into(),
        updated_at: Utc.from_utc_datetime(&record.updated_at).into(),
        attendance_students: students
            .into_iter()
            .map(|student| AttendanceStudent {
                student_id: student.student_id,
                attendance_status: student.attendance_status,
                note: student.note,
            })
            .collect(),
    };
    Ok(AppResponse::success_with_data(response))
}

pub async fn add_attendance_record(
    State(db): State<DatabaseConnection>,
    Path(date): Path<String>,
    Json(payload): Json<UpsertAttendanceRequest>,
) -> Result<Json<AppResponse>, (StatusCode, Json<AppResponse>)> {
    let txn = db
        .begin()
        .await
        .map_err(|_| AppResponse::error(StatusCode::INTERNAL_SERVER_ERROR, "資料庫異常"))?;

    let (parsed_date, id) = parse_date(&date)?;

    let record = find_attendance_records_by_id(&db, date).await?;
    if record.is_some() {
        return Err(AppResponse::error(StatusCode::CONFLICT, "此日期已有簽到表"));
    }

    let record = attendance_records::ActiveModel {
        id: Set(id),
        class_date: Set(parsed_date),
        note: Set(None),
        created_at: Set(Utc::now().naive_utc()),
        updated_at: Set(Utc::now().naive_utc()),
    };

    let record = record
        .insert(&txn)
        .await
        .map_err(|_| AppResponse::error(StatusCode::INTERNAL_SERVER_ERROR, "資料庫異常"))?;

    for student in payload.attendance_students {
        let attendance_student = attendance_students::ActiveModel {
            attendance_record_id: Set(record.id.clone()),
            student_id: Set(student.student_id),
            attendance_status: Set(student.attendance_status),
            note: Set(student.note),
        };

        attendance_student
            .insert(&txn)
            .await
            .map_err(|_| AppResponse::error(StatusCode::INTERNAL_SERVER_ERROR, "資料庫異常"))?;
    }

    txn.commit()
        .await
        .map_err(|_| AppResponse::error(StatusCode::INTERNAL_SERVER_ERROR, "資料庫異常"))?;

    Ok(AppResponse::success("建立成功"))
}

pub async fn update_attendance(
    State(db): State<DatabaseConnection>,
    Path(date): Path<String>,
    Json(payload): Json<UpsertAttendanceRequest>,
) -> Result<Json<AppResponse>, (StatusCode, Json<AppResponse>)> {
    // 解析日期取得 ID
    let (_, attendance_id) = parse_date(&date)?;

    // 開始資料庫交易
    let txn = db
        .begin()
        .await
        .map_err(|_| AppResponse::error(StatusCode::INTERNAL_SERVER_ERROR, "無法開始資料庫交易"))?;

    // 查找並更新主表記錄
    let record = find_attendance_records_by_id(&txn, date.clone())
        .await?
        .ok_or_else(|| AppResponse::error(StatusCode::NOT_FOUND, "沒有該日期的簽到表"))?;

    let mut record: attendance_records::ActiveModel = record.into();
    record.note = Set(payload.note);
    record.updated_at = Set(Utc::now().naive_utc());

    record
        .update(&txn)
        .await
        .map_err(|_| AppResponse::error(StatusCode::INTERNAL_SERVER_ERROR, "更新主表失敗"))?;

    // 刪除原有的學生出席記錄，使用解析後的 attendance_id
    attendance_students::Entity::delete_many()
        .filter(attendance_students::Column::AttendanceRecordId.eq(attendance_id.clone()))
        .exec(&txn)
        .await
        .map_err(|_| AppResponse::error(StatusCode::INTERNAL_SERVER_ERROR, "刪除舊記錄失敗"))?;

    // 插入新的學生出席記錄，使用解析後的 attendance_id
    let new_student_records: Vec<attendance_students::ActiveModel> = payload
        .attendance_students
        .into_iter()
        .map(|student| attendance_students::ActiveModel {
            attendance_record_id: Set(attendance_id.clone()),
            student_id: Set(student.student_id),
            attendance_status: Set(student.attendance_status),
            note: Set(student.note),
            ..Default::default()
        })
        .collect();

    attendance_students::Entity::insert_many(new_student_records)
        .exec(&txn)
        .await
        .map_err(|e| {
            AppResponse::error(
                StatusCode::INTERNAL_SERVER_ERROR,
                format!("插入新記錄失敗，{}", e),
            )
        })?;

    // 提交交易
    txn.commit()
        .await
        .map_err(|_| AppResponse::error(StatusCode::INTERNAL_SERVER_ERROR, "提交交易失敗"))?;

    Ok(AppResponse::success("更新成功"))
}

async fn find_attendance_records_by_id<C>(
    db: &C,
    date: String,
) -> Result<Option<attendance_records::Model>, (StatusCode, Json<AppResponse>)>
where
    C: ConnectionTrait + TransactionTrait,
{
    let (_, id) = parse_date(&date)?;

    attendance_records::Entity::find_by_id(id)
        .one(db)
        .await
        .map_err(|_| AppResponse::error(StatusCode::INTERNAL_SERVER_ERROR, "資料庫異常"))
}

fn parse_date(date: &str) -> Result<(NaiveDate, String), (StatusCode, Json<AppResponse>)> {
    let date = NaiveDate::parse_from_str(date, "%Y-%m-%d")
        .map_err(|_| AppResponse::error(StatusCode::BAD_REQUEST, "錯誤的請求參數"))?;
    let id = date.format("%Y%m%d").to_string();
    Ok((date, id))
}
