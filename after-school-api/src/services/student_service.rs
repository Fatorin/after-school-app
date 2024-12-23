use crate::db::entities::students;
use crate::db::field::update_optional_field;
use crate::models::{AppResponse, StudentView, UpsertStudentRequest};
use axum::extract::{Path, State};
use axum::http::StatusCode;
use axum::Json;
use chrono::Utc;
use sea_orm::ActiveValue::Set;
use sea_orm::{ActiveModelTrait, ColumnTrait, DatabaseConnection, EntityTrait, QueryFilter};
use uuid::Uuid;
use validator::Validate;

pub async fn add_student(
    State(db): State<DatabaseConnection>,
    Json(payload): Json<UpsertStudentRequest>,
) -> Result<Json<AppResponse>, (StatusCode, Json<AppResponse>)> {
    if students::Entity::find()
        .filter(students::Column::IdNumber.eq(&payload.id_number))
        .one(&db)
        .await
        .map_err(|_| AppResponse::error(StatusCode::INTERNAL_SERVER_ERROR, "伺服器發生異常"))?
        .is_some()
    {
        return Err(AppResponse::error(StatusCode::BAD_REQUEST, "此學生已登入"));
    }

    let new_student = students::ActiveModel {
        id: Default::default(),
        name: Set(payload.name),
        gender: Set(payload.gender),
        id_number: Set(payload.id_number),
        joined_at: Set(payload.joined_at.naive_utc()),
        date_of_birth: Set(payload.date_of_birth),
        school_name: Set(payload.school_name),
        grade: Set(payload.grade),
        is_pg: Set(payload.is_pg),
        description: Set(payload.description),
        family_type: Set(payload.family_type),
        family_members: Set(payload.family_members),
        breadwinner: Set(payload.breadwinner),
        occupation: Set(payload.occupation),
        subsidy: Set(payload.subsidy),
        address: Set(payload.address),
        home_ownership: Set(payload.home_ownership),
        home_phone_number: Set(payload.home_phone_number),
        mobile_phone_number: Set(payload.mobile_phone_number),
        chinese_book: Set(payload.chinese_book),
        english_book: Set(payload.english_book),
        math_book: Set(payload.math_book),
        science_book: Set(payload.science_book),
        social_studies_book: Set(payload.social_studies_book),
        line_id: Set(payload.line_id),
        comment: Set(payload.comment),
        updated_at: Set(Utc::now().naive_utc()),
        ..Default::default()
    };

    new_student
        .insert(&db)
        .await
        .map_err(|_| AppResponse::error(StatusCode::INTERNAL_SERVER_ERROR, "伺服器發生異常"))?;

    Ok(AppResponse::success("新增成功"))
}

pub async fn get_students(
    State(db): State<DatabaseConnection>,
) -> Result<Json<AppResponse<Vec<StudentView>>>, (StatusCode, Json<AppResponse>)> {
    let students = students::Entity::find()
        .filter(students::Column::DeletedAt.is_null())
        .all(&db)
        .await
        .map_err(|_| AppResponse::error(StatusCode::INTERNAL_SERVER_ERROR, "資料庫異常"))?;

    let mut result = vec![];
    for student in students {
        let student_view = StudentView::try_from(student).map_err(|_| {
            AppResponse::error(StatusCode::INTERNAL_SERVER_ERROR, "資料轉換出現異常")
        })?;
        result.push(student_view);
    }

    Ok(AppResponse::success_with_data(result))
}

pub async fn update_student(
    State(db): State<DatabaseConnection>,
    Path(id): Path<Uuid>,
    Json(payload): Json<UpsertStudentRequest>,
) -> Result<Json<AppResponse<StudentView>>, (StatusCode, Json<AppResponse>)> {
    if let Err(err) = payload.validate() {
        return Err(AppResponse::error(
            StatusCode::BAD_REQUEST,
            format!("參數不正確。錯誤參數：{}", err),
        ));
    }

    if let Some(student) = find_student_by_id(&db, id).await? {
        let mut student: students::ActiveModel = student.into();

        student.name = Set(payload.name);
        update_optional_field(&mut student.gender, payload.gender);
        update_optional_field(&mut student.date_of_birth, payload.date_of_birth);
        update_optional_field(&mut student.school_name, payload.school_name);
        update_optional_field(&mut student.grade, payload.grade);
        update_optional_field(&mut student.is_pg, payload.is_pg);
        update_optional_field(&mut student.description, payload.description);
        update_optional_field(&mut student.family_type, payload.family_type);
        update_optional_field(&mut student.family_members, payload.family_members);
        update_optional_field(&mut student.breadwinner, payload.breadwinner);
        update_optional_field(&mut student.occupation, payload.occupation);
        update_optional_field(&mut student.subsidy, payload.subsidy);
        update_optional_field(&mut student.address, payload.address);
        update_optional_field(&mut student.home_ownership, payload.home_ownership);
        update_optional_field(&mut student.home_phone_number, payload.home_phone_number);
        update_optional_field(
            &mut student.mobile_phone_number,
            payload.mobile_phone_number,
        );
        update_optional_field(&mut student.chinese_book, payload.chinese_book);
        update_optional_field(&mut student.english_book, payload.english_book);
        update_optional_field(&mut student.math_book, payload.math_book);
        update_optional_field(&mut student.science_book, payload.science_book);
        update_optional_field(
            &mut student.social_studies_book,
            payload.social_studies_book,
        );
        update_optional_field(&mut student.line_id, payload.line_id);
        update_optional_field(&mut student.comment, payload.comment);
        student.joined_at = Set(payload.joined_at.naive_utc());
        student.updated_at = Set(Utc::now().naive_utc());

        let student: students::Model = student
            .update(&db)
            .await
            .map_err(|_| AppResponse::error(StatusCode::INTERNAL_SERVER_ERROR, "更新失敗"))?;

        let student_view = StudentView::try_from(student).map_err(|_| {
            AppResponse::error(StatusCode::INTERNAL_SERVER_ERROR, "資料轉換出現異常")
        })?;

        return Ok(AppResponse::success_with_data(student_view));
    }

    Err(AppResponse::error(
        StatusCode::BAD_REQUEST,
        "找不到對應的學生",
    ))
}

pub async fn delete_student(
    State(db): State<DatabaseConnection>,
    Path(id): Path<Uuid>,
) -> Result<Json<AppResponse>, (StatusCode, Json<AppResponse>)> {
    if let Some(teacher) = find_student_by_id(&db, id).await? {
        let mut teacher: students::ActiveModel = teacher.into();
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

async fn find_student_by_id(
    db: &DatabaseConnection,
    teacher_id: Uuid,
) -> Result<Option<students::Model>, (StatusCode, Json<AppResponse>)> {
    students::Entity::find()
        .filter(students::Column::Id.eq(teacher_id))
        .filter(students::Column::DeletedAt.is_null())
        .one(db)
        .await
        .map_err(|_| AppResponse::error(StatusCode::INTERNAL_SERVER_ERROR, "資料庫異常"))
}
