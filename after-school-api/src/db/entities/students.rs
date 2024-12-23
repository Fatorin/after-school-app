//! `SeaORM` Entity, @generated by sea-orm-codegen 1.1.0

use sea_orm::entity::prelude::*;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq)]
#[sea_orm(table_name = "students")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: Uuid,
    #[sea_orm(column_type = "Text")]
    pub name: String,
    pub gender: Option<i16>,
    #[sea_orm(column_type = "Text")]
    pub id_number: String,
    pub date_of_birth: Option<DateTime>,
    #[sea_orm(column_type = "Text", nullable)]
    pub school_name: Option<String>,
    pub grade: Option<i16>,
    pub is_pg: Option<bool>,
    #[sea_orm(column_type = "Text", nullable)]
    pub description: Option<String>,
    #[sea_orm(column_type = "Text", nullable)]
    pub family_type: Option<String>,
    pub family_members: Option<i16>,
    #[sea_orm(column_type = "Text", nullable)]
    pub breadwinner: Option<String>,
    #[sea_orm(column_type = "Text", nullable)]
    pub occupation: Option<String>,
    #[sea_orm(column_type = "Text", nullable)]
    pub subsidy: Option<String>,
    #[sea_orm(column_type = "Text", nullable)]
    pub address: Option<String>,
    pub home_ownership: Option<i16>,
    #[sea_orm(column_type = "Text", nullable)]
    pub home_phone_number: Option<String>,
    #[sea_orm(column_type = "Text", nullable)]
    pub mobile_phone_number: Option<String>,
    #[sea_orm(column_type = "Text", nullable)]
    pub chinese_book: Option<String>,
    #[sea_orm(column_type = "Text", nullable)]
    pub english_book: Option<String>,
    #[sea_orm(column_type = "Text", nullable)]
    pub math_book: Option<String>,
    #[sea_orm(column_type = "Text", nullable)]
    pub science_book: Option<String>,
    #[sea_orm(column_type = "Text", nullable)]
    pub social_studies_book: Option<String>,
    #[sea_orm(column_type = "Text", nullable)]
    pub line_id: Option<String>,
    #[sea_orm(column_type = "Text", nullable)]
    pub comment: Option<String>,
    pub joined_at: DateTime,
    pub created_at: DateTime,
    pub updated_at: DateTime,
    pub deleted_at: Option<DateTime>,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}