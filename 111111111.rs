use reqwest::Client;

fn main() {
    let client = Client::new();
    let response = client.get("https://example.com").send();

    if response.is_ok() {
        println!("网页已成功打开，状态码：{}", response.status_code());
    } else {
        println!("打开网页失败，错误：{}", response.error().unwrap());
    }
}
