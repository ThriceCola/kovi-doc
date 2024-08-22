# 快速上手

> [!WARNING] 警告
> `Kovi` 目前处于前期快速迭代期，以下内容可能已过期，请以实际情况为准。
> 
> 如有问题请前往 [GitHub Issues](https://github.com/Threkork/Kovi/issues)，或加入官方 QQ 交流群 [857054777](https://qm.qq.com/q/kmpSBOVaCI)。

> [!TIP] 提示
> `Kovi` 目前只支持 OneBot V11 正向 WebSocket 协议。

## 1. 创建一个基本 Rust 项目，添加 Kovi 依赖。

```bash
cargo new bot
cd ./bot
cargo add Kovi
```

## 2. 在 `src/main.rs` 创建 Bot 实例。

```rust
use kovi::build_bot;
fn main() {
    let bot = build_bot!();
    bot.run()
}
```

如果是第一次启动，会提示输入一些信息以创建 `kovi.conf.json` 文件，这是 `Kovi` 运行所需的信息。

```
✔ What is the IP of the OneBot server? · 127.0.0.1
OneBot 服务端的 IP 是什么？ (默认值：127.0.0.1)

✔ What is the port of the OneBot server? · 8081
OneBot 服务端的端口是什么？ (默认值：8081)

✔ What is the access_token of the OneBot server? · 
OneBot 服务端的 access_token 是什么？ (默认值：空)

✔ What is the ID of the main administrator? 
管理员的 ID 是什么？ (无默认值)
```


## 插件开发

### 创建插件

推荐的插件开发方法是创建新目录 `plugins` 储存插件。跟着下面来吧。

首先创建 `Cargo` 工作区，在 `Cargo.toml` 写入 `[workspace]`

```toml
[package]
略
[dependencies]
略

[workspace] // [!code ++]  // [!code focus]
```

接着

```bash
cargo new plugins/hi --lib
```

`Cargo` 会帮你做好一切的。

### 编写插件

编写我们新创建的插件 `plugins/hi/src/lib.rs`

下面是最小实例

```rust
// 导入插件构造结构体
use kovi::PluginBuilder;

#[kovi::plugin] //构造插件
pub fn main(mut plugin: PluginBuilder) {
    // 必须要求main传入 PluginBuilder ，这是插件的基础。
    plugin.on_msg(move |event| {
        // on_msg() 为监听消息，event 里面包含本次消息的所有信息。
        if event.borrow_text() == Some("Hi Bot") {
            event.reply("Hi!") //快捷回复
        }
    });
}
```

`main` 函数写在 `lib.rs` 是因为等下要导出给 `Bot` 实例挂载。

插件一般不需要 `main.rs`

### 挂载插件

将插件导入到 `my-kovi-bot` 的 `main.rs`

```bash
cargo add --path plugins/hi  
```

```rust
use kovi::build_bot;

fn main() {
    let bot = build_bot!(hi,hi2,plugin123);
    bot.run()
}
```

### 更多插件例子

#### bot 主动发言

```rust
use kovi::PluginBuilder;

#[kovi::plugin]
pub fn main(mut plugin: PluginBuilder) {
    // 构造RuntimeBot
    let bot = plugin.build_runtime_bot();
    let user_id = bot.main_admin;

    bot.send_private_msg(user_id, "bot online")
}
```

`main()` 函数 只会在 `Kovi` 启动时运行一次。

向 `plugin.on_msg()` 传入的闭包，会在每一次接收消息时运行。

`Kovi` 已封装所有可用 `OneBot` 标准 API，拓展 API 你可以使用 `RuntimeBot` 的 `send_api()` 来自行发送 API。
