pub fn update_optional_field<T>(field: &mut sea_orm::ActiveValue<Option<T>>, value: Option<T>)
where
    T: Into<sea_orm::Value> + Clone + sea_orm::sea_query::Nullable,
{
    if let Some(inner_value) = value {
        *field = sea_orm::ActiveValue::Set(Some(inner_value));
    } else {
        *field = sea_orm::ActiveValue::NotSet;
    }
}
