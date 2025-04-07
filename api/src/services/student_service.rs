use crate::db::entities::{members, students};
use crate::models::{
    student_and_member_to_view, AddStudentRequest, AppResponse, StudentView, UpdateStudentRequest,
};
use crate::services::member_service::upsert_member_with_context;
use axum::extract::{Path, State};
use axum::http::StatusCode;
use axum::Json;
use chrono::Utc;
use sea_orm::ActiveValue::Set;
use sea_orm::{
    ActiveModelTrait, ColumnTrait, DatabaseConnection, EntityTrait, QueryFilter, TransactionTrait,
};
use uuid::Uuid;
use validator::Validate;

pub async fn get_students(
    State(db): State<DatabaseConnection>,
) -> Result<Json<AppResponse<Vec<StudentView>>>, (StatusCode, Json<AppResponse>)> {
    let students_with_members = students::Entity::find()
        .filter(students::Column::DeletedAt.is_null())
        .find_with_related(members::Entity)
        .all(&db)
        .await
        .map_err(|_| AppResponse::error(StatusCode::INTERNAL_SERVER_ERROR, "資料庫異常"))?;

    let mut result = vec![];
    for (student, mut members) in students_with_members {
        if let Some(member) = members.pop() {
            let student_view = student_and_member_to_view(student, member);
            result.push(student_view);
        } else {
            return Err(AppResponse::error(
                StatusCode::INTERNAL_SERVER_ERROR,
                "Student without member",
            ));
        }
    }

    Ok(AppResponse::success_with_data(result))
}

pub async fn add_student(
    State(db): State<DatabaseConnection>,
    Json(payload): Json<AddStudentRequest>,
) -> Result<Json<AppResponse>, (StatusCode, Json<AppResponse>)> {
    if let Err(err) = payload.validate() {
        return Err(AppResponse::error(
            StatusCode::BAD_REQUEST,
            format!("參數不正確。錯誤參數：{}", err),
        ));
    }

    let member_id = payload.member_id.unwrap_or_else(|| Uuid::nil());

    if find_student_by_id(&db, member_id).await?.is_some() {
        return Err(AppResponse::error(
            StatusCode::BAD_REQUEST,
            "此成員已經是學生",
        ));
    }

    let txn = db
        .begin()
        .await
        .map_err(|_| AppResponse::error(StatusCode::INTERNAL_SERVER_ERROR, "資料庫異常"))?;

    let member = upsert_member_with_context(&txn, member_id, payload.member_dto).await?;

    let new_student = students::ActiveModel {
        member_id: Set(member.id),
        school_name: Set(payload.student_dto.school_name),
        grade: Set(payload.student_dto.grade),
        is_pg: Set(payload.student_dto.is_pg),
        description: Set(payload.student_dto.description),
        family_type: Set(payload.student_dto.family_type),
        family_members: Set(payload.student_dto.family_members),
        breadwinner: Set(payload.student_dto.breadwinner),
        occupation: Set(payload.student_dto.occupation),
        subsidy: Set(payload.student_dto.subsidy),
        home_ownership: Set(payload.student_dto.home_ownership),
        class_joined_at: Set(payload.student_dto.class_joined_at.naive_utc()),
        updated_at: Set(Utc::now().naive_utc()),
        ..Default::default()
    };

    new_student
        .insert(&txn)
        .await
        .map_err(|_| AppResponse::error(StatusCode::INTERNAL_SERVER_ERROR, "伺服器發生異常"))?;

    txn.commit()
        .await
        .map_err(|_| AppResponse::error(StatusCode::INTERNAL_SERVER_ERROR, "資料庫異常"))?;

    Ok(AppResponse::success("新增成功"))
}

pub async fn update_student(
    State(db): State<DatabaseConnection>,
    Path(id): Path<Uuid>,
    Json(payload): Json<UpdateStudentRequest>,
) -> Result<Json<AppResponse<StudentView>>, (StatusCode, Json<AppResponse>)> {
    if let Err(err) = payload.validate() {
        return Err(AppResponse::error(
            StatusCode::BAD_REQUEST,
            format!("參數不正確。錯誤參數：{}", err),
        ));
    }

    let txn = db
        .begin()
        .await
        .map_err(|_| AppResponse::error(StatusCode::INTERNAL_SERVER_ERROR, "資料庫異常"))?;

    let member = upsert_member_with_context(&txn, id, payload.member_dto).await?;

    let student = match find_student_by_id(&db, id).await? {
        Some(student) => {
            let mut student: students::ActiveModel = student.into();
            student.school_name = Set(payload.student_dto.school_name);
            student.grade = Set(payload.student_dto.grade);
            student.is_pg = Set(payload.student_dto.is_pg);
            student.description = Set(payload.student_dto.description);
            student.family_type = Set(payload.student_dto.family_type);
            student.family_members = Set(payload.student_dto.family_members);
            student.breadwinner = Set(payload.student_dto.breadwinner);
            student.occupation = Set(payload.student_dto.occupation);
            student.subsidy = Set(payload.student_dto.subsidy);
            student.home_ownership = Set(payload.student_dto.home_ownership);
            student.class_joined_at = Set(payload.student_dto.class_joined_at.naive_utc());
            student.updated_at = Set(Utc::now().naive_utc());

            let student = student
                .update(&txn)
                .await
                .map_err(|_| AppResponse::error(StatusCode::INTERNAL_SERVER_ERROR, "更新失敗"))?;

            student
        }
        None => {
            return Err(AppResponse::error(
                StatusCode::BAD_REQUEST,
                "無法找到學生資料",
            ));
        }
    };

    txn.commit()
        .await
        .map_err(|_| AppResponse::error(StatusCode::INTERNAL_SERVER_ERROR, "資料庫異常"))?;

    let student_view = student_and_member_to_view(student, member);

    Ok(AppResponse::success_with_data(student_view))
}

pub async fn delete_student(
    State(db): State<DatabaseConnection>,
    Path(id): Path<Uuid>,
) -> Result<Json<AppResponse>, (StatusCode, Json<AppResponse>)> {
    if let Some(student) = find_student_by_id(&db, id).await? {
        let mut student: students::ActiveModel = student.into();
        student.updated_at = Set(Utc::now().naive_utc());
        student.deleted_at = Set(Some(Utc::now().naive_utc()));

        student
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
    id: Uuid,
) -> Result<Option<students::Model>, (StatusCode, Json<AppResponse>)> {
    students::Entity::find()
        .filter(students::Column::MemberId.eq(id))
        .filter(students::Column::DeletedAt.is_null())
        .one(db)
        .await
        .map_err(|_| AppResponse::error(StatusCode::INTERNAL_SERVER_ERROR, "資料庫異常"))
}
