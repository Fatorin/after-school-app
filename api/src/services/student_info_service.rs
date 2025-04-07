use crate::db::entities::{members, student_exams, student_infos};
use crate::models::{
    AppResponse, StudentExamDto, StudentInfoDto, StudentInfoView, UpsertStudentInfoRequest,
};
use crate::services::member_service::find_member_by_id;
use axum::extract::{Path, State};
use axum::http::StatusCode;
use axum::Json;
use sea_orm::{ActiveModelTrait, QueryFilter, Set, TransactionTrait};
use sea_orm::{ColumnTrait, DatabaseConnection, EntityTrait};
use std::collections::HashMap;
use uuid::Uuid;
use validator::Validate;

pub async fn get_student_infos(
    State(db): State<DatabaseConnection>,
) -> Result<Json<AppResponse<Vec<StudentInfoView>>>, (StatusCode, Json<AppResponse>)> {
    let infos_with_exams = student_infos::Entity::find()
        .find_with_related(student_exams::Entity)
        .all(&db)
        .await
        .map_err(|_| AppResponse::error(StatusCode::INTERNAL_SERVER_ERROR, "資料庫異常"))?;

    let student_ids: Vec<Uuid> = infos_with_exams
        .iter()
        .map(|(info, _)| info.student_id)
        .collect();

    let members_list = members::Entity::find()
        .filter(members::Column::Id.is_in(student_ids.clone()))
        .all(&db)
        .await
        .map_err(|_| AppResponse::error(StatusCode::INTERNAL_SERVER_ERROR, "查詢學生姓名失敗"))?;

    let member_name_map: HashMap<Uuid, String> =
        members_list.into_iter().map(|m| (m.id, m.name)).collect();

    let result: Vec<StudentInfoView> = infos_with_exams
        .into_iter()
        .map(|(info, exams)| {
            let info_dto = StudentInfoDto {
                academic_year: info.academic_year,
                chinese_book: info.chinese_book,
                english_book: info.english_book,
                math_book: info.math_book,
                science_book: info.science_book,
                social_studies_book: info.social_studies_book,
                comment: info.comment,
            };

            let exams_dto = exams
                .into_iter()
                .map(|exam| StudentExamDto {
                    semester: exam.semester,
                    exam_type: exam.exam_type,
                    chinese_score: exam.chinese_score,
                    english_score: exam.english_score,
                    math_score: exam.math_score,
                    science_score: exam.science_score,
                    social_studies_score: exam.social_studies_score,
                })
                .collect();

            StudentInfoView {
                id: info.id,
                name: member_name_map
                    .get(&info.student_id)
                    .cloned()
                    .unwrap_or_else(|| "未知姓名".to_string()),
                info_dto,
                exams_dto,
            }
        })
        .collect();

    Ok(AppResponse::success_with_data(result))
}

pub async fn add_student_infos(
    State(db): State<DatabaseConnection>,
    Path(id): Path<Uuid>,
    Json(payload): Json<UpsertStudentInfoRequest>,
) -> Result<Json<AppResponse>, (StatusCode, Json<AppResponse>)> {
    if let Err(err) = payload.validate() {
        return Err(AppResponse::error(
            StatusCode::BAD_REQUEST,
            format!("參數不正確。錯誤參數：{}", err),
        ));
    }

    let student_info_dto = payload.info_dto;
    let student_exams_dto = payload.exams_dto;

    let txn = db
        .begin()
        .await
        .map_err(|e| AppResponse::error(StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    let student_info = student_infos::ActiveModel {
        student_id: Set(id),
        academic_year: Set(student_info_dto.academic_year),
        chinese_book: Set(student_info_dto.chinese_book),
        english_book: Set(student_info_dto.english_book),
        math_book: Set(student_info_dto.math_book),
        science_book: Set(student_info_dto.science_book),
        social_studies_book: Set(student_info_dto.social_studies_book),
        comment: Set(student_info_dto.comment),
        ..Default::default()
    };

    let inserted_info = student_info
        .insert(&txn)
        .await
        .map_err(|e| AppResponse::error(StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    for exam_dto in student_exams_dto {
        let student_exam = student_exams::ActiveModel {
            student_infos_id: Set(inserted_info.id),
            semester: Set(exam_dto.semester),
            exam_type: Set(exam_dto.exam_type),
            chinese_score: Set(exam_dto.chinese_score),
            english_score: Set(exam_dto.english_score),
            math_score: Set(exam_dto.math_score),
            science_score: Set(exam_dto.science_score),
            social_studies_score: Set(exam_dto.social_studies_score),
            ..Default::default()
        };

        student_exam
            .insert(&txn)
            .await
            .map_err(|e| AppResponse::error(StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
    }

    txn.commit()
        .await
        .map_err(|e| AppResponse::error(StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    Ok(AppResponse::success("新增成功"))
}

pub async fn update_student_infos(
    State(db): State<DatabaseConnection>,
    Path(id): Path<Uuid>,
    Json(payload): Json<UpsertStudentInfoRequest>,
) -> Result<Json<AppResponse<StudentInfoView>>, (StatusCode, Json<AppResponse>)> {
    if let Err(err) = payload.validate() {
        return Err(AppResponse::error(
            StatusCode::BAD_REQUEST,
            format!("參數不正確。錯誤參數：{}", err),
        ));
    }

    let student_info_dto = payload.info_dto;
    let student_exams_dto = payload.exams_dto;

    let txn = db
        .begin()
        .await
        .map_err(|e| AppResponse::error(StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    // 查找現有的 student_info
    let existing_info = student_infos::Entity::find()
        .filter(student_infos::Column::StudentId.eq(id))
        .filter(student_infos::Column::AcademicYear.eq(student_info_dto.academic_year))
        .one(&txn)
        .await
        .map_err(|e| AppResponse::error(StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?
        .ok_or_else(|| {
            AppResponse::error(StatusCode::NOT_FOUND, "找不到對應的學生資料".to_string())
        })?;

    // 更新 student_info
    let mut student_info: student_infos::ActiveModel = existing_info.into();
    student_info.academic_year = Set(student_info_dto.academic_year);
    student_info.chinese_book = Set(student_info_dto.chinese_book);
    student_info.english_book = Set(student_info_dto.english_book);
    student_info.math_book = Set(student_info_dto.math_book);
    student_info.science_book = Set(student_info_dto.science_book);
    student_info.social_studies_book = Set(student_info_dto.social_studies_book);
    student_info.comment = Set(student_info_dto.comment);
    student_info.updated_at = Set(chrono::Utc::now().naive_utc());

    let updated_info = student_info
        .update(&txn)
        .await
        .map_err(|e| AppResponse::error(StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    // 查找並更新現有的 student_exams（假設固定為兩筆）
    for (_, exam_dto) in student_exams_dto.iter().enumerate() {
        let existing_exam = student_exams::Entity::find()
            .filter(student_exams::Column::StudentInfosId.eq(updated_info.id))
            .filter(student_exams::Column::Semester.eq(exam_dto.semester))
            .filter(student_exams::Column::ExamType.eq(exam_dto.exam_type))
            .one(&txn)
            .await
            .map_err(|e| AppResponse::error(StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

        match existing_exam {
            Some(exam) => {
                // 更新現有考試記錄
                let mut student_exam: student_exams::ActiveModel = exam.into();
                student_exam.chinese_score = Set(exam_dto.chinese_score);
                student_exam.english_score = Set(exam_dto.english_score);
                student_exam.math_score = Set(exam_dto.math_score);
                student_exam.science_score = Set(exam_dto.science_score);
                student_exam.social_studies_score = Set(exam_dto.social_studies_score);
                student_exam.updated_at = Set(chrono::Utc::now().naive_utc());

                student_exam.update(&txn).await.map_err(|e| {
                    AppResponse::error(StatusCode::INTERNAL_SERVER_ERROR, e.to_string())
                })?;
            }
            None => {
                // 如果不存在，則新增
                let student_exam = student_exams::ActiveModel {
                    student_infos_id: Set(updated_info.id),
                    semester: Set(exam_dto.semester),
                    exam_type: Set(exam_dto.exam_type),
                    chinese_score: Set(exam_dto.chinese_score),
                    english_score: Set(exam_dto.english_score),
                    math_score: Set(exam_dto.math_score),
                    science_score: Set(exam_dto.science_score),
                    social_studies_score: Set(exam_dto.social_studies_score),
                    created_at: Set(chrono::Utc::now().naive_utc()),
                    updated_at: Set(chrono::Utc::now().naive_utc()),
                    ..Default::default()
                };

                student_exam.insert(&txn).await.map_err(|e| {
                    AppResponse::error(StatusCode::INTERNAL_SERVER_ERROR, e.to_string())
                })?;
            }
        }
    }

    // 提交交易
    txn.commit()
        .await
        .map_err(|e| AppResponse::error(StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    // 獲取學生姓名
    let member = find_member_by_id(&db, id).await?;
    let student_name = member
        .map(|m| m.name)
        .unwrap_or_else(|| "未知姓名".to_string());

    // 返回更新後的資料
    Ok(AppResponse::success_with_data(StudentInfoView {
        id,
        name: student_name,
        info_dto: StudentInfoDto {
            academic_year: updated_info.academic_year,
            chinese_book: updated_info.chinese_book,
            english_book: updated_info.english_book,
            math_book: updated_info.math_book,
            science_book: updated_info.science_book,
            social_studies_book: updated_info.social_studies_book,
            comment: updated_info.comment,
        },
        exams_dto: student_exams_dto.into_iter().collect(),
    }))
}

pub async fn delete_student_infos(
    State(db): State<DatabaseConnection>,
    Path(id): Path<Uuid>,
) -> Result<Json<AppResponse>, (StatusCode, Json<AppResponse>)> {
    let txn = db
        .begin()
        .await
        .map_err(|e| AppResponse::error(StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    let delete_result = student_infos::Entity::delete_many()
        .filter(student_infos::Column::StudentId.eq(id))
        .exec(&txn)
        .await
        .map_err(|e| AppResponse::error(StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    if delete_result.rows_affected == 0 {
        return Err(AppResponse::error(
            StatusCode::NOT_FOUND,
            "找不到對應的學生資料".to_string(),
        ));
    }

    txn.commit()
        .await
        .map_err(|e| AppResponse::error(StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    Ok(AppResponse::success("刪除成功"))
}
