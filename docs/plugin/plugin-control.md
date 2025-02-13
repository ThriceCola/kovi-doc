# 插件运行时卸载与挂载

> [!CAUTION]
> 在使用此功能前，请确保将插件 长时间运行的新线程 从 `tokio::spawn()` 或者 `std::thread::spawn()` 转移到 `kovi::spawn()`
>
> `tokio::spawn` 或者 `std::thread::spawn` 创建的线程不会交给 Kovi 管理，在使用 Kovi 的卸载功能时，会导致无法关闭这些不属于 Kovi 的线程。
>
> `kovi::spawn` 的内部使用 `tokio::spawn` 。并将此线程的关闭句柄交给 Kovi 管理。



## `bot.disable_plugin()` 插件卸载

插件卸载时，会自动运行插件的 Drop 监听闭包。

```rust
use kovi::PluginBuilder as P;

#[kovi::plugin]
async fn main() {
    let bot = P::get_runtime_bot();
    P::on_msg(move |e| disable_my_plugin(e, bot.clone()));
}

async fn disable_my_plugin(e: Arc<MsgEvent>, bot: Arc<RuntimeBot>) {
    if e.borrow_text() == Some("关闭 my-plugin 插件") {
        bot.disable_plugin("my-plugin").unwrap(); // [!code focus]
    }
}
```

## `bot.enable_plugin()` 插件挂载

```rust
use kovi::PluginBuilder as P;

#[kovi::plugin]
async fn main() {
    let bot = P::get_runtime_bot();
    P::on_msg(move |e| enable_my_plugin(e, bot.clone()));
}

async fn enable_my_plugin(e: Arc<MsgEvent>, bot: Arc<RuntimeBot>) {
    if e.borrow_text() == Some("开启 my-plugin 插件") {
        bot.enable_plugin("my-plugin").unwrap(); // [!code focus]
    }
}
```

## `bot.restart_plugin()` 插件重载

因为要等待插件drop函数运行完毕再加载插件，为了阻塞，所以是异步函数。

```rust
use kovi::PluginBuilder as P;

#[kovi::plugin]
async fn main() {
    let bot = P::get_runtime_bot();
    P::on_msg(move |e| enable_my_plugin(e, bot.clone()));
}

async fn enable_my_plugin(e: Arc<MsgEvent>, bot: Arc<RuntimeBot>) {
    if e.borrow_text() == Some("重载 my-plugin 插件") {
        bot.restart_plugin("my-plugin").await.unwrap(); // [!code focus]
    }
}
```
