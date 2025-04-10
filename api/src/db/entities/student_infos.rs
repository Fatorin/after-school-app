//! `SeaORM` Entity, @generated by sea-orm-codegen 1.1.0

use sea_orm::entity::prelude::*;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq)]
#[sea_orm(table_name = "student_infos")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: Uuid,
    pub student_id: Uuid,
    pub academic_year: i16,
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
    pub comment: Option<String>,
    pub created_at: DateTime,
    pub updated_at: DateTime,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(has_many = "super::student_exams::Entity")]
    StudentExams,
    #[sea_orm(
        belongs_to = "super::students::Entity",
        from = "Column::StudentId",
        to = "super::students::Column::MemberId",
        on_update = "NoAction",
        on_delete = "Cascade"
    )]
    Students,
}

impl Related<super::student_exams::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::StudentExams.def()
    }
}

impl Related<super::students::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Students.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
