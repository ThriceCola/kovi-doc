# 快速上手

> [!TIP] 提示
> 如有问题请前往 [GitHub Issues](https://github.com/thricecola/Kovi/issues)，或加入 QQ 交流群 [857054777](https://qm.qq.com/q/kmpSBOVaCI)。

## 1. 创建一个基本 Rust 项目，添加 Kovi 依赖。

> [!TIP] 提示
> `Kovi` 已拥有 `kovi-cli` 工具，使用 `kovi-cli` 工具可快速管理 `Kovi`
>
> ```bash
> cargo install kovi-cli
> ```

使用 `kovi-cli` 或者 `cargo` 创建基本项目。

::: code-group

```bash [kovi-cli]
cargo kovi new my-kovi-bot
cd ./my-kovi-bot
```

```bash [cargo]
cargo new my-kovi-bot
cd ./my-kovi-bot
cargo add Kovi
```

:::

## 2. 在 `src/main.rs` 创建 Bot 实例。

> 如果是使用 `kovi-cli` 的话，已经看到在 `src/main.rs` 已经生成好bot实例。

```rust
use kovi::build_bot;

fn main() {
    let bot = build_bot!();
    bot.run()
}
```

第一次启动，会提示输入一些信息以创建 `kovi.conf.json` 文件，这是 `Kovi` 运行所需的信息。

```
✔ What is the type of the host of the OneBot server? · IPv4
OneBot 服务端的类型是什么？ (默认值：IPv4)

✔ What is the IP of the OneBot server? · 127.0.0.1
OneBot 服务端的 IP 是什么？ (默认值：127.0.0.1)

✔ What is the port of the OneBot server? · 8081
OneBot 服务端的端口是什么？ (默认值：8081)

✔ What is the access_token of the OneBot server? (Optional)
OneBot 服务端的 access_token 是什么？ (默认值：空)

✔ What is the ID of the main administrator? (Not used yet)
管理员的 ID 是什么？ (无默认值)

✔ Do you want to view more optional options? · No
是否需要查看更多可选选项？ (默认值：否)
```

## 3. 插件开发

### 1. 创建插件

推荐的插件开发方法是创建新目录 `plugins` 储存插件。跟着下面来吧。

首先创建 Cargo 工作区，在 `Cargo.toml` 写入 `[workspace]` 。

> 如果是使用 `kovi-cli` 的话，此处已自动生成 `[workspace]` 。

```toml
[package]
...
[dependencies]
...

    // [!code focus:2]
[workspace] // [!code ++]
```

接着

::: code-group

```bash [kovi-cli]
cargo kovi create hi
```

```bash [cargo]
cargo new plugins/hi --lib
```

:::

`kovi-cli` 或者 `cargo` 会帮你做好一切的。

可以看到创建了新的 `plugins/hi` 目录，这也是推荐的插件开发方法，有目录管理总会是好的。

```shell
.
├── plugins # [!code ++]
│   └── hi  # [!code ++]
│       └── src # [!code ++]
│           └── lib.rs  # [!code ++]
├── src
│   └── main.rs
│
```

### 2. 编写插件

编写我们新创建的插件 `plugins/hi/src/lib.rs`

下面是最小实例

```rust
// 导入插件构造结构体
use kovi::PluginBuilder as plugin;

#[kovi::plugin] // 构造插件
async fn my_plugin_main() {
    plugin::on_msg(|event| async move {
        // on_msg() 为监听消息，event 里面包含本次消息的所有信息。
        if event.borrow_text() == Some("Hi Bot") {
            event.reply("Hi!") //快捷回复
        }
    });
}
```

`main` 函数写在 `lib.rs` 是因为等下要导出给 `Bot` 实例挂载。

插件一般不需要 `main.rs` 。

### 3. 挂载插件

将依赖添加进根项目。

> 如果你的 `kovi-cli` 是最新版，在创建插件时，就已经帮你 add 好了插件。
>
> 不再需要使用 `cargo kovi add hi` 。

::: code-group

```bash [kovi-cli]
cargo kovi add hi
```

```bash [cargo]
cargo add --path plugins/hi
```

:::

将插件导入到 `my-kovi-bot` 的 `main.rs` 。

```rust
use kovi::build_bot;

fn main() {
    let bot = build_bot!(hi, hi2, plugin123);
    bot.run()
}
```

### 更多插件例子

#### bot 主动发言

```rust
use kovi::PluginBuilder as plugin;

#[kovi::plugin]
async fn my_plugin_main() {
    // 构造 RuntimeBot
    let bot = plugin::get_runtime_bot();
    let user_id = bot.main_admin;

    bot.send_private_msg(user_id, "bot online")
}
```

插件的 `#[kovi::plugin]` 入口函数只会在 插件 启动时运行一次。

所有的 [监听闭包](/plugin/on_event) 都是惰性的，不会马上运行，在接收事件时才会触发运行。

`Kovi` 已封装所有可用 `OneBot` 标准 API，拓展 API 你可以使用 `RuntimeBot` 的 `send_api()` 来自行发送 API。

## 4. 消息命令控制

推荐使用 官方的 cmd 插件来通过消息命令控制 bot 。

```shell
cargo kovi add cmd
```

接着挂载插件

```rust
let bot = build_bot!(kovi_plugin_cmd);
```

试试给 bot 发送消息 `.kovi` 吧。
