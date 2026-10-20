use std::{
    io::{Read, Write},
    net::TcpListener,
};
pub fn start() -> Result<String, String> {
    let listener =
        TcpListener::bind("127.0.0.1:0").map_err(|_| "Cannot start local player origin")?;
    let origin = format!("http://127.0.0.1:{}", listener.local_addr().unwrap().port());
    std::thread::spawn(move || {
        for mut socket in listener.incoming().flatten() {
            let _ = socket.set_read_timeout(Some(std::time::Duration::from_secs(2)));
            let mut buf = [0; 4096];
            let n = socket.read(&mut buf).unwrap_or(0);
            let req = String::from_utf8_lossy(&buf[..n]);
            let (status, body) = if req.starts_with("GET /player?") {
                ("200 OK", include_str!("player.html"))
            } else {
                ("404 Not Found", "Not found")
            };
            let _=write!(socket,"HTTP/1.1 {status}\r\nContent-Type: text/html; charset=utf-8\r\nReferrer-Policy: strict-origin-when-cross-origin\r\nContent-Security-Policy: default-src 'none'; script-src 'unsafe-inline' https://www.youtube.com https://s.ytimg.com; frame-src https://www.youtube.com; style-src 'unsafe-inline';\r\nContent-Length: {}\r\nConnection: close\r\n\r\n{body}",body.len());
        }
    });
    Ok(origin)
}
