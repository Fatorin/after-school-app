use crate::db::entities::{student_grades, students};
use crate::db::field::update_optional_field;
use crate::models::{AppResponse, StudentGradeView, UpsertStudentGradeRequest};
use axum::extract::{Path, State};
use axum::http::StatusCode;
use axum::Json;
use chrono::Utc;
use sea_orm::ActiveValue::Set;
use sea_orm::{
    ActiveModelTrait, ColumnTrait, DatabaseConnection, EntityTrait, JoinType, QueryFilter,
    QuerySelect, RelationTrait,
};
use uuid::Uuid;
use validator::Validate;

pub async fn add_grades(
    State(db): State<DatabaseConnection>,
    Json(payload): Json<UpsertStudentGradeRequest>,
) -> Result<Json<AppResponse>, (StatusCode, Json<AppResponse>)> {
    if student_grades::Entity::find()
        .filter(student_grades::Column::StudentId.eq(payload.student_id))
        .filter(student_grades::Column::AcademicYear.eq(payload.academic_year))
        .filter(student_grades::Column::Semester.eq(payload.semester))
        .one(&db)
        .await
        .map_err(|_| AppResponse::error(StatusCode::INTERNAL_SERVER_ERROR, "伺服器發生異常"))?
        .is_some()
    {
        return Err(AppResponse::error(
            StatusCode::BAD_REQUEST,
            "此學生該學年的學期成績已登錄",
        ));
    }

    let new_student_grade = student_grades::ActiveModel {
        id: Default::default(),
        student_id: Set(payload.student_id),
        academic_year: Set(payload.academic_year),
        semester: Set(payload.semester),
        exam_type: Set(payload.exam_type),
        chinese_book: Set(payload.chinese_book),
        english_book: Set(payload.english_book),
        math_book: Set(payload.math_book),
        science_book: Set(payload.science_book),
        social_studies_book: Set(payload.social_studies_book),
        chinese_score: Set(payload.chinese_score),
        english_score: Set(payload.english_score),
        math_score: Set(payload.math_score),
        science_score: Set(payload.science_score),
        social_studies_score: Set(payload.social_studies_score),
        comment: Set(payload.comment),
        updated_at: Set(Utc::now().naive_utc()),
        ..Default::default()
    };

    new_student_grade
        .insert(&db)
        .await
        .map_err(|_| AppResponse::error(StatusCode::INTERNAL_SERVER_ERROR, "伺服器發生異常"))?;

    Ok(AppResponse::success("新增成功"))
}

pub async fn get_grades(
    State(db): State<DatabaseConnection>,
) -> Result<Json<AppResponse<Vec<StudentGradeView>>>, (StatusCode, Json<AppResponse>)> {
    let grades = student_grades::Entity::find()
        .join(
            JoinType::InnerJoin,
            student_grades::Relation::Students.def(),
        )
        .select_also(students::Entity)
        .filter(student_grades::Column::DeletedAt.is_null())
        .all(&db)
        .await
        .map_err(|_| AppResponse::error(StatusCode::INTERNAL_SERVER_ERROR, "資料庫異常"))?;

    let result: Vec<StudentGradeView> = grades
        .into_iter()
        .map(|(student_grades, student)| {
            StudentGradeView::try_from((student_grades, student.unwrap().name))
        })
        .collect::<Result<_, _>>()
        .map_err(|_| AppResponse::error(StatusCode::INTERNAL_SERVER_ERROR, "資料轉換出現異常"))?;

    Ok(AppResponse::success_with_data(result))
}

pub async fn update_grades(
    State(db): State<DatabaseConnection>,
    Path(id): Path<Uuid>,
    Json(payload): Json<UpsertStudentGradeRequest>,
) -> Result<Json<AppResponse<StudentGradeView>>, (StatusCode, Json<AppResponse>)> {
    if let Err(err) = payload.validate() {
        return Err(AppResponse::error(
            StatusCode::BAD_REQUEST,
            format!("參數不正確。錯誤參數：{}", err),
        ));
    }

    if let Some(grades) = find_student_grade_by_id(&db, id).await? {
        let mut student_grades: student_grades::ActiveModel = grades.into();
        student_grades.academic_year = Set(payload.academic_year);
        student_grades.semester = Set(payload.semester);
        update_optional_field(&mut student_grades.chinese_book, payload.chinese_book);
        update_optional_field(&mut student_grades.english_book, payload.english_book);
        update_optional_field(&mut student_grades.math_book, payload.math_book);
        update_optional_field(&mut student_grades.science_book, payload.science_book);
        update_optional_field(
            &mut student_grades.social_studies_book,
            payload.social_studies_book,
        );
        update_optional_field(&mut student_grades.chinese_score, payload.chinese_score);
        update_optional_field(&mut student_grades.english_score, payload.english_score);
        update_optional_field(&mut student_grades.math_score, payload.math_score);
        update_optional_field(&mut student_grades.science_score, payload.science_score);
        update_optional_field(
            &mut student_grades.social_studies_score,
            payload.social_studies_score,
        );
        student_grades.updated_at = Set(Utc::now().naive_utc());

        let student_grades: student_grades::Model = student_grades
            .update(&db)
            .await
            .map_err(|_| AppResponse::error(StatusCode::INTERNAL_SERVER_ERROR, "更新失敗"))?;

        let name = students::Entity::find()
            .filter(students::Column::Id.eq(student_grades.student_id))
            .select_only()
            .column(students::Column::Name)
            .into_tuple::<String>() // 改用 into_tuple
            .one(&db)
            .await
            .map_err(|e| {
                AppResponse::error(
                    StatusCode::INTERNAL_SERVER_ERROR,
                    format!("查詢學生失敗,{}", e),
                )
            })?
            .ok_or_else(|| AppResponse::error(StatusCode::BAD_REQUEST, "找不到對應學生"))?;

        let view = StudentGradeView::try_from((student_grades, name)).map_err(|_| {
            AppResponse::error(StatusCode::INTERNAL_SERVER_ERROR, "資料轉換出現異常")
        })?;

        return Ok(AppResponse::success_with_data(view));
    }

    Err(AppResponse::error(
        StatusCode::BAD_REQUEST,
        "找不到對應的學生",
    ))
}

pub async fn delete_grades(
    State(db): State<DatabaseConnection>,
    Path(id): Path<Uuid>,
) -> Result<Json<AppResponse>, (StatusCode, Json<AppResponse>)> {
    if let Some(teacher) = find_student_grade_by_id(&db, id).await? {
        let mut teacher: student_grades::ActiveModel = teacher.into();
        teacher.updated_at = Set(Utc::now().naive_utc());
        teacher.deleted_at = Set(Some(Utc::now().naive_utc()));

        teacher
            .update(&db)
            .await
            .map_err(|_| AppResponse::error(StatusCode::INTERNAL_SERVER_ERROR, "更新失敗"))?;

        Ok(AppResponse::success("刪除成功"))
    } else {
        Err(AppResponse::error(
            StatusCode::BAD_REQUEST,
            "找不到對應的教職員",
        ))
    }
}

async fn find_student_grade_by_id(
    db: &DatabaseConnection,
    id: Uuid,
) -> Result<Option<student_grades::Model>, (StatusCode, Json<AppResponse>)> {
    student_grades::Entity::find()
        .filter(student_grades::Column::Id.eq(id))
        .filter(student_grades::Column::DeletedAt.is_null())
        .one(db)
        .await
        .map_err(|_| AppResponse::error(StatusCode::INTERNAL_SERVER_ERROR, "資料庫異常"))
}
