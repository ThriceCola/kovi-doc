# 监听事件

通过 `PluginBuilder` 可以监听事件

> [!WARNING]
> `PluginBuilder` 只能在插件入口处，也就是由 `#[kovi::plugin]` 标注的函数的这个主线程中使用。请不要在监听闭包里使用 `PluginBuilder` 监听闭包不属于插件主线程。
> 

[[toc]]

## on_msg()

添加消息监听函数, 包括好友私聊、群消息以及讨论组消息


关于 [AllMsgEvent](/plugin/event#allmsgevent) ，点击前往查看

```rust
#[kovi::plugin]
async fn main() {
    PluginBuilder::on_msg(|event| async move {// [!code focus]
        event.reply("hi");// [!code focus]
    });// [!code focus]
}
```

## on_admin_msg()

添加管理员消息监听函数, 包括好友私聊、群消息以及讨论组消息，`Kovi` 会帮你筛选消息。


关于 [AllMsgEvent](/plugin/event#allmsgevent) ，点击前往查看

```rust
#[kovi::plugin]
async fn main() {
    PluginBuilder::on_admin_msg(|event| async move {// [!code focus]
        event.reply("hi");// [!code focus]
    });// [!code focus]
}
```

## on_private_msg()

添加好友私聊消息监听函数。


关于 [AllMsgEvent](/plugin/event#allmsgevent) ，点击前往查看

```rust
#[kovi::plugin]
async fn main() {
    PluginBuilder::on_private_msg(|event| async move {// [!code focus]
        event.reply("hi");// [!code focus]
    });// [!code focus]
}
```

## on_group_msg()

添加群消息监听函数。


关于 [AllMsgEvent](/plugin/event#allmsgevent) ，点击前往查看

```rust
#[kovi::plugin]
async fn main() {
    PluginBuilder::on_group_msg(|event| async move {// [!code focus]
        event.reply("hi");// [!code focus]
    });// [!code focus]
}
```

## on_all_notice()

添加 OneBot 的 `通知事件` 监听函数。


关于 [AllNotionEvent](/plugin/event#allnotionevent)，点击前往查看

```rust
#[kovi::plugin]
async fn main() {
    PluginBuilder::on_all_notice(|event| async move {// [!code focus]
        info!("{}", event.notice_type); // [!code focus]
    }); // [!code focus]
}
```

## on_all_request()

添加 OneBot 的 `请求事件` 监听函数。


关于 [AllRequestEvent](/plugin/event#allrequestevent) ，点击前往查看

```rust
#[kovi::plugin]
async fn main() {
    PluginBuilder::on_all_request(|event| async move {// [!code focus]
        info!("{}", event.request_type); // [!code focus]
    }); // [!code focus]
}
```


## cron() 和 cron_use_croner()

添加一个定时任务。

传入的 cron 会使用 `croner` 进行解析。

```rust
use kovi::croner;
use kovi::{log::info, PluginBuilder as P};

#[kovi::plugin]
async fn main() {
    // 每天00:00
    P::cron("0 0 * * *", || async {
        info!("00:00");
    })
    .unwrap();

    // 每一秒
    P::cron("* * * * * *", || async {
        info!("每一秒");
    })
    .unwrap();

    let cron = croner::Cron::new("0 0 * * *").parse().unwrap();
    P::cron_use_croner(cron, || async {
        info!("00:00");
    });
}
```



## drop() 

添加 程序退出 监听函数。

如果你需要在程序结束时，运行一些代码，可以使用此监听来监听程序退出。

为了提高用户侧退出体验，程序在接收到第二次退出信号的时候，会强制退出程序。

> [!CAUTION]
> 
> 本函数运行起来非常复杂，对于主线程意外 panic! ，本函数不会触发。
>
> 只会在监听到系统退出信号时或者断开 OneBot 服务端连接时，才会运行传入的闭包。

```rust
#[kovi::plugin]
async fn main() {
    PluginBuilder::drop(|| async { // [!code focus]
        println!("正在退出程序"); // [!code focus]
    }); // [!code focus]
}
```


## on_msg_send()

添加自身消息发送监听函数。

需打开 `message_sent` feature。

还要注意服务端是否有这一个功能。

```rust
#[kovi::plugin]
async fn main() {
    PluginBuilder::on_msg_sent(|_event| async move {// [!code focus]
        info!("我自己发了消息"); // [!code focus]
    });// [!code focus]
}
```