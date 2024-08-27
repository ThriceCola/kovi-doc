# 监听事件

通过 `PluginBuilder` 可以监听事件

[[toc]]

## plugin.on_msg()

添加消息监听函数, 包括好友私聊、群消息以及讨论组消息

需传入一个闭包，闭包类型为 `Fn(&AllMsgEvent) + Send + Sync + 'static`

关于 [AllMsgEvent](/plugin/event#allmsgevent) ，点击前往查看

```rust
#[kovi::plugin]
pub fn main(mut plugin: PluginBuilder) {
    plugin.on_msg(move |event| {// [!code focus]
        event.reply("Hi!") // [!code focus]
    });// [!code focus]
}
```

## plugin.on_admin_msg()

添加管理员消息监听函数, 包括好友私聊、群消息以及讨论组消息，`Kovi` 会帮你筛选消息。

需传入一个闭包，闭包类型为 `Fn(&AllMsgEvent) + Send + Sync + 'static`

关于 [AllMsgEvent](/plugin/event#allmsgevent) ，点击前往查看

```rust
#[kovi::plugin]
pub fn main(mut plugin: PluginBuilder) {
    plugin.on_admin_msg(move |event| {// [!code focus]
        event.reply("Hi!") // [!code focus]
    });// [!code focus]
}
```


## plugin.on_all_notice()

添加 OneBot 的 `通知事件` 监听函数。

需传入一个闭包，闭包类型为 `Fn(&AllNoticeEvent) + Send + Sync + 'static`

关于 [AllNotionEvent](/plugin/event#allnotionevent)，点击前往查看

```rust
#[kovi::plugin]
pub fn main(mut plugin: PluginBuilder) {
    plugin.on_all_notice(|event| { // [!code focus]
        println!("{}", event.notice_type); // [!code focus]
    }); // [!code focus]
}
```

## plugin.on_all_request() <Badge type="tip" text="^0.4.0" />

添加 OneBot 的 `请求事件` 监听函数。

需传入一个闭包，闭包类型为 `Fn(&AllRequestEvent) + Send + Sync + 'static`

关于 [AllRequestEvent](/plugin/event#allrequestevent) ，点击前往查看

```rust
#[kovi::plugin]
pub fn main(mut plugin: PluginBuilder) {
    plugin.on_all_request(|event| { // [!code focus]
        println!("{}", event.request_type); // [!code focus]
    }); // [!code focus]
}
```

## plugin.drop() <Badge type="tip" text="^0.6.0" />

添加 程序退出 监听函数。

需传入一个闭包，闭包类型为 `Fn() + Send + Sync + 'static`

如果你需要在程序结束时，运行一些代码，可以使用此监听来监听程序退出。


> [!CAUTION]
> 
> 本函数运行起来非常复杂，对于主线程意外 panic! (这取决于 Kovi 开发有没有 Bug ) ，本函数不会触发。
>
> 只会在监听到系统退出信号时或者断开OneBot连接时，才会运行传入的闭包。

```rust
#[kovi::plugin]
pub fn main(mut plugin: PluginBuilder) {
    plugin.drop(|| { // [!code focus]
        println!("{}", event.request_type); // [!code focus]
    }); // [!code focus]
}
```

## 异步

以上所有监听都可以在 后面加上 `_async` 变成异步函数。

```rust
use kovi::{tokio, PluginBuilder};
use std::time::Duration;

#[kovi::plugin]
pub fn main(mut p: PluginBuilder) {
    p.on_admin_msg_async(|e| async move {
        tokio::time::sleep(Duration::from_secs(2)).await;
        e.reply("两秒后");
    });
}
```