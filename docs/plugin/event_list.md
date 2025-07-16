# Event

通过 `PluginBuilder::on` 监听，传入的闭包要求接受一个 `event`，此 `event` 便是事件。

```rust
use kovi::PluginBuilder as P;

#[kovi::plugin]
pub fn main() {
    P::on_msg(|event| async move{// [!code focus]
        event.reply("Hi!") // [!code focus]
    });
}
```

[[toc]]

## MsgEvent

具体可看 [OneBot v11 文档 Message Event 部分](https://github.com/botuniverse/onebot-11/blob/master/event/message.md)

```rust
pub struct MsgEvent {
    /// 事件发生的时间戳
    pub time: i64,
    /// 收到事件的机器人 登陆号
    pub self_id: i64,
    /// 上报类型
    pub post_type: PostType,
    /// 消息类型
    pub message_type: String,
    /// 消息子类型，如果是好友则是 friend，如果是群临时会话则是 group
    pub sub_type: String,
    /// 消息内容
    pub message: Message,
    /// 消息 ID
    pub message_id: i32,
    /// 群号
    pub group_id: Option<i64>,
    /// 发送者号
    pub user_id: i64,
    /// 匿名信息，如果不是匿名消息则为 null
    pub anonymous: Option<Anonymous>,
    /// 原始消息内容
    pub raw_message: String,
    /// 字体
    pub font: i32,
    /// 发送人信息
    pub sender: Sender,

    /// 处理过的纯文本，如果是纯图片或无文本，此初为None
    pub text: Option<String>,
    /// 处理过的文本，会解析成人类易读形式，里面会包含\[image\]\[face\]等解析后字符串
    pub human_text: String,
    /// 原始未处理的onebot消息，为json格式
    pub original_json: Value,
}
```

---

## MsgEvent 方法

### `event.reply()`

快速回复消息，传入 Message 类型，因为字符串可以转换成Message类型，所以可以传入字符串


### `event.reply_and_quote()`

快速回复消息，并且引用，传入 Message 类型，因为字符串可以转换成Message类型，所以可以传入字符串


### `event.is_group()`

事件是否是群聊消息，如果是群聊消息则返回 `true`，否则返回 `false`。


### `event.is_private()`

事件是否是私聊消息，如果是私聊消息则返回 `true`，否则返回 `false`。


### `event.get_text()`

获取文本，如果没有文本则会返回空字符串，如果只需要借用，请使用 `borrow_text()`


### `event.get_sender_nickname()`

获取发送者昵称


### `event.get()`

可以通过这个获取到想要的一切动态值，会返回 Option

### `event["foo"]`

可以通过这个获取到想要的一切动态值，但是这个用法小心 panic!() 崩溃

### `event.borrow_text()`

借用 event 的 text

### `event.reply_text()`

这个函数需开启 cqstring 特性

快速回复消息，并且kovi不进行解析，直接发送字符串

---

## AdminMsgEvent

和 MsgEvent 类似，不再赘述

## PrivateMsgEvent

和 MsgEvent 类似，不再赘述

## GroupMsgEvent

和 MsgEvent 类似，不再赘述

## MsgSendFromServerEvent

和 MsgEvent 类似，不再赘述

## MsgSendFromKoviEvent

停停停，这个可不是 *‘不在赘述’* 。

由于消息解析必须保证不阻塞，这个类型只监听了来自 Kovi 的 发送Api信息 与 对应的响应信息，所以结构不是 MsgEvent 那样子的哦

```rust
/// 此事件会监听以下消息发送
///
/// "send_msg" => MsgSendFromKoviType::SendMsg
/// "send_private_msg" => MsgSendFromKoviType::SendPrivateMsg
/// "send_group_msg" => MsgSendFromKoviType::SendGroupMsg
/// "send_forward_msg" => MsgSendFromKoviType::SendForwardMsg
/// "send_private_forward_msg" => MsgSendFromKoviType::SendPrivateForwardMsg
/// "send_group_forward_msg" => MsgSendFromKoviType::SendGroupForwardMsg
#[derive(Debug, Clone)]
pub struct MsgSendFromKoviEvent {
    /// 事件类型
    pub event_type: MsgSendFromKoviType,
    /// 发送消息的API内容
    pub send_api: SendApi,
    /// 发送消息的API响应结果
    pub res: Result<ApiReturn, ApiReturn>,

    /// 不推荐的消息发送方式
    pub api_tx: mpsc::Sender<ApiAndOneshot>,
}
#[derive(Debug, Copy, Clone)]
pub enum MsgSendFromKoviType {
    SendMsg,
    SendPrivateMsg,
    SendGroupMsg,
    SendForwardMsg,
    SendPrivateForwardMsg,
    SendGroupForwardMsg,
}
```

你可以通过 响应结果 获取对应的消息ID，通过这个事件的

`impl CanSendApi for MsgSendFromKoviEvent` 的 `CanSendApi` trait 的 `send_api_return()`

来发送 Api 获取信息的完整内容

```rust

// 这样用，这个是 MsgSendFromKoviEvent
event.send_api_return("get_msg", json!({"message_id": 1})).await

// 或者这样，这个是 RuntimeBot
bot.get_msg(1).await
```

## NotionEvent

具体可看 [OneBot v11 文档 Notion Event 部分](https://github.com/botuniverse/onebot-11/blob/master/event/notice.md)

```rust
pub struct NoticeEvent {
    /// 事件发生的时间戳
    pub time: i64,
    /// 收到事件的机器人 登陆号
    pub self_id: i64,
    /// 上报类型
    pub post_type: PostType,
    /// 通知类型
    pub notice_type: String,

    /// 原始的onebot消息，已处理成json格式
    pub original_json: Value,
}
```

## RequestEvent

具体可看 [OneBot v11 文档 Request Event 部分](https://github.com/botuniverse/onebot-11/blob/master/event/request.md)

```rust
pub struct RequestEvent {
    /// 事件发生的时间戳
    pub time: i64,
    /// 收到事件的机器人 登陆号
    pub self_id: i64,
    /// 上报类型
    pub post_type: PostType,
    /// 请求类型
    pub request_type: String,

    /// 原始的onebot消息，已处理成json格式
    pub original_json: Value,
}
```

## LifecycleEvent

这个没什么用

```rust
pub struct LifecycleEvent {
    pub meta_event_type: String,
    pub post_type: PostType,
    pub self_id: i64,
    pub time: i64,
    pub sub_type: LifecycleAction,
}

#[serde(rename_all = "lowercase")]
pub enum LifecycleAction {
    Enable,
    Disable,
    Connect,
}
```
