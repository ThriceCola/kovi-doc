# 生命周期

插件的 `main()` 只会在 插件 启动时运行一次。

所有 [监听闭包](onevent) 都是惰性的，不会马上运行，只会在接收消息时才会运行，来一次运行一次。

***

# 插件运行时卸载与挂载

> [!CAUTION]
>在使用此功能前，请确保将插件 长时间运行的新线程 从 `tokio::spawn()` 或者 `std::thread::spawn()` 转移到 `kovi::spawn()`
>
>`tokio::spawn` 或者 `std::thread::spawn` 创建的线程不会交给 Kovi 管理，在使用 Kovi 的卸载功能时，会导致无法关闭这些不属于 Kovi 的线程。

`kovi::spawn` 的内部使用 `tokio::spawn` 。并将此线程的关闭句柄交给 Kovi 管理。

这两个函数方法，存在与 `KoviApi` trait 里面。现代的 IDE 与插件提示会自动帮你导入。

## 插件卸载 `bot.disable_plugin()`

插件卸载时，会自动运行插件的 Drop 监听闭包。

```rust
use kovi::PluginBuilder as P;
use kovi::bot::runtimebot::kovi_api::KoviApi as _; // [!code focus]

#[kovi::plugin]
async fn main() {
    let bot = P::get_runtime_bot();

    P::on_msg(move |e| disable_my_plugin(e, bot.clone()));
}

async fn disable_my_plugin(e: Arc<AllMsgEvent>, bot: Arc<RuntimeBot>) {
    if e.borrow_text() != Some("关闭 my-plugin 插件") {
        bot.disable_plugin("my-plugin").unwrap(); // [!code focus]
    }
}
```

## 插件挂载 `bot.enable_plugin()`

```rust
use kovi::PluginBuilder as P;
use kovi::bot::runtimebot::kovi_api::KoviApi as _; // [!code focus]

#[kovi::plugin]
async fn main() {
    let bot = P::get_runtime_bot();

    P::on_msg(move |e| enable_my_plugin(e, bot.clone()));
}

async fn enable_my_plugin(e: Arc<AllMsgEvent>, bot: Arc<RuntimeBot>) {
    if e.borrow_text() == Some("开启 my-plugin 插件") {
        bot.enable_plugin("my-plugin").unwrap(); // [!code focus]
    }
}
```
