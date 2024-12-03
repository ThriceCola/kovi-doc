# event

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

## AllMsgEvent

具体可看 [OneBot v11 文档 Message Event 部分](https://github.com/botuniverse/onebot-11/blob/master/event/message.md)

```rust
pub struct AllMsgEvent {
    /// 事件发生的时间戳
    pub time: i64,
    /// 收到事件的机器人 登陆号
    pub self_id: i64,
    /// 上报类型
    pub post_type: String,
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
    /// 原始未处理的onebot消息，为json格式，使用需处理
    pub original_msg: String,
}
```

## AllMsgEvent 方法

#### `event.reply()`

快速回复消息，传入 Message 类型，因为字符串可以转换成Message类型，所以可以传入字符串

***

#### `event.reply_and_quote()`

快速回复消息，并且引用，传入 Message 类型，因为字符串可以转换成Message类型，所以可以传入字符串

***

#### `event.reply_text()`

这个函数需开启 cqstring 特性

快速回复消息，并且kovi不进行解析，直接发送字符串

***

#### `event.get_text()`

获取文本，如果没有文本则会返回空字符串，如果只需要借用，请使用 `borrow_text()`

***

#### `event.get_sender_nickname()`

获取发送者昵称

***

#### `event.borrow_text()`

借用 event 的 text

## AllNotionEvent

具体可看 [OneBot v11 文档 Notion Event 部分](https://github.com/botuniverse/onebot-11/blob/master/event/notice.md)

```rust
pub struct AllNoticeEvent {
    /// 事件发生的时间戳
    pub time: i64,
    /// 收到事件的机器人 登陆号
    pub self_id: i64,
    /// 上报类型
    pub post_type: String,
    /// 通知类型
    pub notice_type: String,

    /// 原始的onebot消息，已处理成json格式
    pub original_json: Value,
    /// 原始未处理的onebot消息，为json格式，使用需处理
    pub original_msg: String,
}
```

## AllRequestEvent <Badge type="tip" text="^0.4.0" />

具体可看 [OneBot v11 文档 Request Event 部分](https://github.com/botuniverse/onebot-11/blob/master/event/request.md)

```rust
pub struct AllRequestEvent {
    /// 事件发生的时间戳
    pub time: i64,
    /// 收到事件的机器人 登陆号
    pub self_id: i64,
    /// 上报类型
    pub post_type: String,
    /// 请求类型
    pub request_type: String,

    /// 原始的onebot消息，已处理成json格式
    pub original_json: Value,
    /// 原始未处理的onebot消息，为json格式，使用需处理
    pub original_msg: String,
}
```
