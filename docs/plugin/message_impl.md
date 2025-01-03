# Message 方法

[[toc]]

***

## `msg.contains()` 检查 Message 是否包含任意 segment

检查 `Message` 是否包含任意一项 `segment`。返回 `bool`。

```rust
use kovi::bot::message::Message;
use serde_json::json;

let msg1: Message = Message::from("Hi"); // [!code focus:13]
let msg2: Message = Message::from_value(json!(
    [
        {
            "type":"text",
            "data":{
                "text":"Some msg"    
            }
        }
    ]
)).unwrap();
assert!(msg1.contains("text"));
assert!(msg2.contains("text"));
```

***

## `msg.get()` 获取 Message 中任意一种 segment

获取 `Message` 中任意一种 `segment` 。返回 `Vec<Segment>`，有多少项，就会返回多少项。

```rust
use kovi::bot::message::Message;
use serde_json::{json, Value};

let msg: Message = Message::from_value(json!( // [!code focus:30]
    [
        {
            "type":"text",
            "data":{
                "text":"Some msg"    
            }
        },
        {
            "type":"face",
            "data":{
                "id":"0"    
            }
        },
    ]
)).unwrap();
let text_value:Value = json!({
            "type":"text",
            "data":{
                "text":"Some msg"    
            }
        });
let face_value:Value = json!({
            "type":"face",
            "data":{
                "id":"0"    
            }
        });
assert_eq!(msg.get("text")[0], text_value);
assert_eq!(msg.get("face")[0], face_value);
```

***

## `msg.to_human_string()` Message 解析成人类可读字符串

`Message` 解析成人类可读字符串, 会将里面的 `segment` 转换成 `[type]` 字符串，如： `image` segment 会转换成 `[image]` 字符串，不要靠此函数做判断，可能不同版本会改变内容。

***

## `msg.add_text()` 消息加上文字

消息加上文字

```rust
let msg = Message::new() // [!code focus:5]
    .add_text("文字")
    .add_face(46)
    .add_face(46)
    .add_text("text");

event.reply(msg);
```

***

## `msg.add_at()` 消息加上 @

消息加上 `at`

```rust
let msg = Message::new().add_at("123456") // [!code focus]

event.reply(msg);
```

***

## `msg.add_reply()` 消息加上引用

消息加上引用

```rust
let msg = Message::new() // [!code focus]
    .add_reply("123456") // [!code focus]

event.reply(msg);
```

***

## `msg.add_face()` 消息加上表情

消息加上表情, 具体 id 请看服务端文档, 本框架不提供

```rust
let msg = Message::new() // [!code focus:5]
    .add_text("文字")
    .add_face(46)
    .add_face(46)
    .add_text("text");

event.reply(msg);
```

***

## `msg.add_image()` 消息加上图片

消息加上图片

传入

绝对路径，例如 <file:///C:\\Users\Richard\Pictures\1.png>，格式使用 file URI, 注意 Windows 与 Linux 文件格式会不同，具体看 OneBot 服务端实现。

网络 URL，例如 <https://abcsomeimageabc123.com/image.jpg>

Base64 编码，例如 `base64://AAAAAbbbbbCCCCCddddd==`

```rust
let msg = Message::new() // [!code focus]
    .add_image("file:///表情包/abc.jpg") // [!code focus]

event.reply(msg);
```

***

## `msg.add_segment()` 消息加上 segment

消息加上 `segment`，具体可看 [OneBot v11 文档 Segment 部分](https://github.com/botuniverse/onebot-11/blob/master/message/segment.md)

***

## `msg.push_text()` 消息末尾加上文字

同 `msg.add_text()` 

***

## `msg.push_at()` 消息末尾加上 @

同 `msg.add_at()` 

## `msg.push_reply()` 消息末尾加上引用

同 `msg.add_reply()` 

***

## `msg.push_face()` 消息末尾加上表情

同 `msg.add_face()` 

***

## `msg.push_image()` 消息末尾加上图片

同 `msg.add_image()` 