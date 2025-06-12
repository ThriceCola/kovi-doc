# Message

[[toc]]

## 什么是 Message

如果需要发送消息，那必须得是 `Message`。

值得一提的是，本框架的所有发送消息 Api 都已经实现了字符串自动转换成 `Message`。

具体解释，可以看 [OneBot v11 文档 Message 部分](https://github.com/botuniverse/onebot-11/blob/master/message/README.md)

## 构建 Message


### 1. 可以使用 `Message::new()` `Message::default()` 构建新的空消息

```rust
let msg_a = Message::new();
let msg_b = Message::default();

assert_eq!(msg_a, msg_b);
```

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

> [!WARNING]
>  Kovi 不会保证 `Segment` 的内部是否正确，你需要自行确认。
>
>  Kovi 不会保证 `Segment` 的内部是否正确，你需要自行确认。
>
>  Kovi 不会保证 `Segment` 的内部是否正确，你需要自行确认。


## `CQMessage`

OneBot v11 含有两种消息， `CQString` 和 `Array`。

Kovi 默认只提供 `Array` 类型。

`CQMessage` 是 Kovi 给 cqstring 提供的封装。使用需打开 feature `cqstring`。这时，Kovi 向 服务端 发送消息会使用 cqstring，而不会使用 array。

`CQMessage` 与 `Message` 两者可以互相转换。使用 From 或者 Into 即可。

如果想要对 `CQMessage` 进行查询或者获取，需要将它转换成 `Message`。除此之外，`CQMessage` 和 `Message` 是一样的。

需要注意的是，为了 Kovi 正确运行，监听闭包 MsgEvent 中的消息仍然是 `Message` ，只有发送时才会强迫使用 `CQMessage`。

对于 `CQMessage` ，Kovi 开发只会维护基本功能，不会对此太过上心。
