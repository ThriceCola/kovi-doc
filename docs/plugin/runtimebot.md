# RuntimeBot

通过 `plugin.build_runtime_bot()` 可以获取到 `RuntimeBot` 里面可以获取到 Bot 的信息，以及发送 Api。

[[toc]]

## RuntimeBot 结构体

```rust
pub struct RuntimeBot {
    pub main_admin: i64, /// 主管理员
    pub admin: Vec<i64>, /// 副管理员，不包含主管理员
    pub host: IpAddr,
    pub port: u16,
    pub api_tx: mpsc::Sender<ApiMpsc>, /// 可以发送api，请按照OneBot v11发送api，不然会失败
}
```

## 如何构建 RuntimeBot

```rust
#[kovi::plugin]
pub fn main(mut plugin: PluginBuilder) { // [!code focus]
    let bot = plugin.build_runtime_bot(); // [!code focus]
}
```

如何在多个监听闭包中使用 RuntimeBot

```rust
#[kovi::plugin]
pub fn main(mut plugin: PluginBuilder) { // [!code focus]
    let bot = Arc::new(plugin.build_runtime_bot()); // [!code focus]
}
```

## 封装了什么Api

所有的标准 OneBot v11 Api 都已经封装在 RuntimeBot 里。

标准 Api 查看 [api列表](/plugin/api)


## 拓展 Api

请查看[拓展 Api](/plugin/apilist#拓展-api)




