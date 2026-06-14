# 监听事件

正如在前面 "快速上手" 看到的，通过 `PluginBuilder` 可以监听事件。

> [!WARNING]
> `PluginBuilder` 只能在插件入口处，也就是由 `#[kovi::plugin]` 标注的函数的这个主线程中使用。请不要在监听闭包里使用 `PluginBuilder` ，监听闭包不属于插件主线程。
>

## 如何监听事件

向 PluginBuilder 去指定一个类型，声明我需要这一个事件即可监听一个事件。

你可以点击下面不同的代码窗口，查看对应的事件类型和监听函数。

::: code-group

```rust [milky-MsgEvent]
use kovi::PluginBuilder;
use kovi_milky::MsgEvent;
use std::sync::Arc;

#[kovi::plugin]
async fn main() {
    PluginBuilder::on(|event: Arc<MsgEvent>| async move {});
}
```

```rust [onebot-MsgEvent]
use kovi::PluginBuilder;
use kovi_onebot::MsgEvent;
use std::sync::Arc;

#[kovi::plugin]
async fn main() {
    PluginBuilder::on(|event: Arc<MsgEvent>| async move {});
}
```
```rust [onebot-AdminMsgEvent]
use kovi::PluginBuilder;
use kovi_onebot::AdminMsgEvent;
use std::sync::Arc;

#[kovi::plugin]
async fn main() {
    PluginBuilder::on(|event: Arc<AdminMsgEvent>| async move {});
}
```
::: 


是的没错，Kovi 通过了一些 ~~魔法~~ 让 on 可以通过指定`事件类型`，就可以监听此事件。

当然还有下面这种写法

```rust
#[kovi::plugin]
async fn main() {
    PluginBuilder::on::<MsgEvent, _>(|event| async move {});
}
```

甚至可以写出这种极其简约的写法，这也是最推崇的方法

```rust
use kovi_onebot::MsgEvent;
use kovi::PluginBuilder as P;
use std::sync::Arc;

#[kovi::plugin]
async fn main(){
    P::on(foo)
}

async fn foo(e: Arc<MsgEvent>){
    todo!()
}
```


将 `PluginBuilder` 重命名为 `P`， 这样写代码非常的便利。


```rust
use kovi::PluginBuilder as P;
use kovi_onebot::AdminMsgEvent;
use std::sync::Arc;

#[kovi::plugin]
async fn main() {
    P::on(|event: Arc<AdminMsgEvent>| async move {});
}
```

## 特殊监听 - drop() 程序退出或插件卸载监听

添加 程序退出或插件卸载 任务。

如果你需要在插件结束时，运行一些代码，可以使用此监听来注册插件结束退出任务。

为了提高用户侧退出体验，程序在接收到第二次退出信号的时候，会强制退出程序。

> [!CAUTION]
>
> 对于程序退出。
>
> 本函数运行起来非常复杂，对于主线程意外 panic! ，本函数不会触发。
>
> 只会在监听到系统退出信号时或者断开 OneBot 服务端连接时，才会运行传入的闭包。

```rust
#[kovi::plugin]
async fn main() {
    PluginBuilder::drop(|| async { // [!code focus]
        println!("正在关闭插件"); // [!code focus]
    }); // [!code focus]
}
```


## 特殊监听 - cron() 和 cron_use_croner() 定时任务

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


## 其他监听函数

上面是由 Kovi 框架提供的事件监听，为了开发者便于开发，这里还提供一些其他的监听函数。


### on_msg() 消息监听 <Badge text="由驱动器提供" />

添加消息监听函数, 包括好友私聊、群消息以及讨论组消息

关于 [MsgEvent](/plugin/event_list#msgevent) ，点击前往查看

```rust
#[kovi::plugin]
async fn main() {
    PluginBuilder::on_msg(|event| async move {// [!code focus]
        event.reply("hi");// [!code focus]
    });// [!code focus]
}
```




### on_admin_msg() 管理员消息监听 <Badge text="由驱动器提供" />

添加管理员消息监听函数, 包括好友私聊、群消息以及讨论组消息，`Kovi` 会帮你筛选消息。


关于 [AdminMsgEvent](/plugin/event_list#msgevent) ，点击前往查看

```rust
#[kovi::plugin]
async fn main() {
    PluginBuilder::on_admin_msg(|event| async move {// [!code focus]
        event.reply("hi");// [!code focus]
    });// [!code focus]
}
```

### on_private_msg() 私聊消息监听 <Badge text="由驱动器提供" />

添加好友私聊消息监听函数。


关于 [PrivateMsgEvent](/plugin/event_list#msgevent) ，点击前往查看

```rust
#[kovi::plugin]
async fn main() {
    PluginBuilder::on_private_msg(|event| async move {// [!code focus]
        event.reply("hi");// [!code focus]
    });// [!code focus]
}
```

### on_group_msg() 群消息监听 <Badge text="由驱动器提供" />

添加群消息监听函数。


关于 [GroupMsgEvent](/plugin/event_list#msgevent) ，点击前往查看

```rust
#[kovi::plugin]
async fn main() {
    PluginBuilder::on_group_msg(|event| async move {// [!code focus]
        event.reply("hi");// [!code focus]
    });// [!code focus]
}
```

### on_notice() 通知事件监听 <Badge text="由驱动器提供" /> <Badge text="仅 OneBot" />

添加 OneBot 的 `通知事件` 监听函数。


关于 [NotionEvent](/plugin/event_list#notionevent)，点击前往查看

```rust
#[kovi::plugin]
async fn main() {
    PluginBuilder::on_notice(|event| async move {// [!code focus]
        info!("{}", event.notice_type); // [!code focus]
    }); // [!code focus]
}
```

### on_request() 请求事件监听 <Badge text="由驱动器提供" /> <Badge text="仅 OneBot" />

添加 OneBot 的 `请求事件` 监听函数。


关于 [RequestEvent](/plugin/event_list#requestevent) ，点击前往查看

```rust
#[kovi::plugin]
async fn main() {
    PluginBuilder::on_request(|event| async move {// [!code focus]
        info!("{}", event.request_type); // [!code focus]
    }); // [!code focus]
}
```
