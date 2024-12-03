# RuntimeBot

通过 `PluginBuilder::get_runtime_bot()` 可以获取到 `RuntimeBot` ，里面可以获取到 `Bot` 的信息，以及发送 API。

[[toc]]

## RuntimeBot 结构体

```rust
pub struct RuntimeBot {
    pub main_admin: i64, /// 主管理员
    pub admin: Vec<i64>, /// 副管理员，不包含主管理员
    pub host: IpAddr,
    pub port: u16,
    pub api_tx: mpsc::Sender<ApiOneshot>, /// 不推荐的 api 发送方式，请改用 bot.send_api() 发送api。
}
```

## 如何构建 RuntimeBot

```rust
#[kovi::plugin]
async fn main() { 
    let bot = PluginBuilder::get_runtime_bot(); // [!code focus]
}
```

## 封装了什么 API

所有的标准 OneBot v11 API 都已经封装在 `RuntimeBot` 里。

标准 API 查看 [API 列表](/api/onebot_api)

## 拓展 API

拓展 Api 可以通过 Kovi 的一些拓展插件来获取。

如：使用 [kovi-plugin-expand-napcat](https://crates.io/crates/kovi-plugin-expand-napcat) 获取 [NapCat](https://github.com/NapNeko/NapCatQQ) 的拓展。

如果需要自行发送服务端的拓展 API，使用 `bot.send_api()` 和 `bot.send_api_return()` 实现。

一种是无需关注返回值的 API，另一种是需要关注返回值的 API。

如下

```rust
let bot = PluginBuilder::get_runtime_bot()
let params = json!({
    "some_user_id":123,
    "some_group_id":123,
});
bot.send_api("some_api", params);
```

```rust
let bot = PluginBuilder::get_runtime_bot()
let params = json!({
    "some_user_id":123,
    "some_group_id":123,
});
let api_return = bot.send_api_return("some_api", params).expect("意外出错");
```





