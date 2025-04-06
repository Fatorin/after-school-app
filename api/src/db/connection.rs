use crate::config::CONFIG;
use crate::db::entities::{members, teachers};
use crate::models;
use bcrypt::{hash, DEFAULT_COST};
use chrono::Utc;
use log::info;
use sea_orm::{
    ActiveModelTrait, Database, DatabaseConnection, DbErr, EntityTrait, QuerySelect, Set,
    TransactionTrait,
};

pub async fn db_connection() -> Result<DatabaseConnection, DbErr> {
    let database_url = format!(
        "postgresql://{}:{}@{}:{}/{}",
        CONFIG.database.user,
        CONFIG.database.password,
        CONFIG.database.host,
        CONFIG.database.port,
        CONFIG.database.name
    );

    Database::connect(&database_url).await
}

pub async fn init(db: &DatabaseConnection) -> Result<(), String> {
    let teacher_exists = teachers::Entity::find()
        .limit(1)
        .one(db)
        .await
        .map_err(|e| format!("資料庫異常，異常原因：{}", e.to_string()))?
        .is_some();

    if teacher_exists {
        return Ok(());
    }

    let password_hash = hash(CONFIG.auth.default_password.as_bytes(), DEFAULT_COST)
        .map_err(|_| "無法產生預設密碼")?;

    let txn = db
        .begin()
        .await
        .map_err(|e| format!("系統異常，異常原因：{}", e.to_string()))?;

    let new_member = members::ActiveModel {
        name: Set(CONFIG.auth.default_name.clone()),
        joined_at: Set(Utc::now().naive_utc()),
        ..Default::default()
    };

    let new_member = new_member
        .insert(&txn)
        .await
        .map_err(|e| format!("無法建立新的成員，異常原因：{}", e.to_string()))?;

    let new_teacher = teachers::ActiveModel {
        member_id: Set(new_member.id),
        username: Set(CONFIG.auth.default_username.clone()),
        password: Set(password_hash),
        role_type: Set(models::RoleType::SuperAdmin.into()),
        employment_type: Set(models::EmploymentType::FullTime.into()),
        ..Default::default()
    };

    new_teacher
        .insert(&txn)
        .await
        .map_err(|e| format!("無法建立新的教職員，異常原因：{}", e.to_string()))?;

    txn.commit()
        .await
        .map_err(|e| format!("系統異常，原因：{}", e.to_string()))?;

    info!("已成功建立預設教職員");

    Ok(())
}
