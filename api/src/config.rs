use serde::Deserialize;
use std::{fs, sync::LazyLock};

#[derive(Debug, Deserialize, Clone)]
pub struct Config {
    pub environment: String,
    pub server: ServerConfig,
    pub database: DatabaseConfig,
    pub logger: LoggerConfig,
    pub auth: AuthConfig,
}

#[derive(Debug, Deserialize, Clone)]
pub struct ServerConfig {
    pub address: String,
    pub port: u16,
    pub cors: String,
}

#[derive(Debug, Deserialize, Clone)]
pub struct DatabaseConfig {
    pub host: String,
    pub port: u16,
    pub name: String,
    pub user: String,
    pub password: String,
}

#[derive(Debug, Deserialize, Clone)]
pub struct LoggerConfig {
    pub level: String,
    pub format: String,
}

#[derive(Debug, Deserialize, Clone)]
pub struct AuthConfig {
    pub jwt_secret: String,
    pub default_name: String,
    pub default_username: String,
    pub default_password: String,
}

pub static CONFIG: LazyLock<Config> =
    LazyLock::new(|| load_config().expect("Failed to load initial config"));

pub fn load_config() -> Result<Config, Box<dyn std::error::Error>> {
    let file_path = match cfg!(debug_assertions) {
        true => "configs/development.yaml",
        false => "configs/production.yaml",
    };

    let content = fs::read_to_string(file_path)?;

    let interpolated_content = shellexpand::full(&content)?.to_string();

    let config: Config = serde_yml::from_str(&interpolated_content)?;
    Ok(config)
}
