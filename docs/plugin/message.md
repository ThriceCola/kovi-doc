# Message

[[toc]]

## 什么是 Message

如果需要发送消息，那必须得是 `Message`。

值得一提的是，本框架的所有发送消息 Api 都已经实现了字符串自动转换成 `Message`。

OneBot v11 含有两种消息， `CQString` 和 `Array`。

Kovi 默认只提供 `Array` 类型。

具体解释，可以看 [OneBot v11 文档 Message 部分](https://github.com/botuniverse/onebot-11/blob/master/message/README.md)

## 构建 Message


### 1. 可以使用 `Message::new()` `Message::default()` 构建新的空消息

***

### 2. 可以从以下两者轻松转换成 `Message` 类型。使用 `Message::from()` 或 `.into()` 即可。

#### `字符串`

```rust
let msg_a = Message::from("你好啊");
let msg_b: Message = "你好啊👋".into();
```

#### `Vec<Segment>`

```rust
let mut vec = Vec::new();

let segment = Segment::new("text", json!({"text": "Hello world"}));

vec.push(segment);

let msg = Message::from(vec);
```

***

### 3. 以下两者，你需要从 `Message::from_value()` 转换。

#### `serde_json::Value::String`

```rust
let msg: Message = Message::from_value(json!("你好啊👋")).unwrap();
```

#### `serde_json::Value::Array`

这会在内部调用 `Message::from_vec_segment_value()`。解析出错会返回 `kovi::Error::ParseError`

```rust
let msg: Message = Message::from_value(json!(
    [
        {
            "type":"text",
            "data":{
                "text":"你好啊👋"    
            }
        }
    ]
)).unwrap();
```

> [!CAUTION]
> 
> 只有 `serde_json::Value::String` 和 `serde_json::Value::Array` 可以正确解析，
> 
> 对于其他的 `serde_json::Value` 类型，`Message::from_value` 会返回 `kovi::Error::ParseError` 。

***

### 4. 还有一种特殊情况，假设你的 Value 是 Segment。

#### `Vec<Value>`

你需要从 `Message::from_vec_segment_value()` 转换。

***

> [!WARNING]
> 需要注意的是 Kovi 不会保证 `Segment` 的正确性，你需要自行确认是否正确。
> 
> 需要注意的是 Kovi 不会保证 `Segment` 的正确性，你需要自行确认是否正确。
> 
> 需要注意的是 Kovi 不会保证 `Segment` 的正确性，你需要自行确认是否正确。

## Message 方法


### `msg.contains()` 检查 Message 是否包含任意 segment

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

### `msg.get()` 获取 Message 中任意一种 segment

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

### `msg.add_text()` 消息加上文字

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

### `msg.add_at()` 消息加上 @

消息加上 `at`

```rust
let msg = Message::new().add_at("123456") // [!code focus]

event.reply(msg);
```

***

### `msg.add_reply()` 消息加上引用

消息加上引用

```rust
let msg = Message::new() // [!code focus]
    .add_reply("123456") // [!code focus]

event.reply(msg);
```

***

### `msg.add_face()` 消息加上表情

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

### `msg.add_image()` 消息加上图片

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

### `msg.add_segment()` 消息加上 segment

消息加上 `segment`，具体可看 [OneBot v11 文档 Segment 部分](https://github.com/botuniverse/onebot-11/blob/master/message/segment.md)

***

### `msg.to_human_string()` Message 解析成人类可读字符串

`Message` 解析成人类可读字符串, 会将里面的 `segment` 转换成 `[type]` 字符串，如： `image` segment 会转换成 `[image]` 字符串，不要靠此函数做判断，可能不同版本会改变内容。

## `CQMessage`

`CQMessage` 是 Kovi 给 cqstring 提供的封装。使用需打开 feature `cqstring`。此时，Kovi 向 服务端 发送消息会用 cqstring，而不会使用 array。

`CQMessage` 与 `Message` 是一样的，两者可以互相转换。使用 From 或者 Into 即可。

想要对 `CQMessage` 进行查询或者获取，你需要将它转换成 `Message`。除此之外，`CQMessage` 与 `Message` 是一样的。

需要注意，on_msg() 监听闭包中的 event 事件，仍然是 `Message` ，只有发送时才会强迫使用 `CQMessage`。

对于 `CQMessage` ，Kovi 开发只会维护基本功能，不会对此太过上心。