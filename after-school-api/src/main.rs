use after_school_api::config::CONFIG;
use after_school_api::{db, routes};
use tracing::info;
use std::net::SocketAddr;

#[tokio::main]
async fn main() {
    // 初始化日誌
    tracing_subscriber::fmt().init();

    // 載入環境變數
    info!("Initial Config: {}", CONFIG.environment);

    // 初始化資料庫
    let conn = db::connection::db_connection()
        .await
        .expect("Failed to connect to database");

    db::connection::init(&conn).await.expect("Init failed");

    // 初始化路由
    let app = routes::new_route(conn);

    // 啟動伺服器
    let addr: SocketAddr = format!("{}:{}", CONFIG.server.address, CONFIG.server.port)
        .parse()
        .expect("無法解析地址");

    info!("Server is work on: {}", addr);
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
