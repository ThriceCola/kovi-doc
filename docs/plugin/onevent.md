# 监听事件

通过 `PluginBuilder` 可以监听事件

[[toc]]

## PluginBuilder::on_msg()

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

## PluginBuilder::on_admin_msg()

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

## PluginBuilder::on_private_msg()

添加好友私聊消息监听函数。


关于 [PrivateMsgEvent](/plugin/event#privatemggevent) ，点击前往查看

```rust
#[kovi::plugin]
async fn main() {
    PluginBuilder::on_private_msg(|event| async move {// [!code focus]
        event.reply("hi");// [!code focus]
    });// [!code focus]
}
```

## PluginBuilder::on_group_msg()

添加群消息监听函数。


关于 [GroupMsgEvent](/plugin/event#groupmsgevent) ，点击前往查看

```rust
#[kovi::plugin]
async fn main() {
    PluginBuilder::on_group_msg(|event| async move {// [!code focus]
        event.reply("hi");// [!code focus]
    });// [!code focus]
}
```

## PluginBuilder::on_all_notice()

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

## PluginBuilder::on_all_request()

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

## PluginBuilder::drop() 

添加 程序退出 监听函数。

如果你需要在程序结束时，运行一些代码，可以使用此监听来监听程序退出。


> [!CAUTION]
> 
> 本函数运行起来非常复杂，对于主线程意外 panic! (这取决于 Kovi 开发有没有 Bug ) ，本函数不会触发。
>
> 只会在监听到系统退出信号时或者断开 OneBot 服务端连接时，才会运行传入的闭包。

```rust
#[kovi::plugin]
async fn main() {
    PluginBuilder::drop(|| async move { // [!code focus]
        println!("正在退出程序"); // [!code focus]
    }); // [!code focus]
}
```