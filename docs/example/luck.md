# 开始我们的第一个插件

我们写一个插件作为入门的例子吧，“每日幸运值” 来作为第一个插件最好不过了。简单且实用。

首先用 kovi-cli 创建一个插件

```bash
cargo kovi create luck
```

我们还可以简写使用

```bash
cargo kovi c luck -s
```

`-s` 选项可以创建最简洁的插件模板

创建了一个新的 `plugins/luck` 目录。

```js
.
├── plugins // [!code ++]
│   └── luck // [!code ++]
│       └── src // [!code ++]
│           └── lib.rs // [!code ++]
├── src
│   └── main.rs
│
```

第一步我们要想一下要监听什么样子的消息。

这样吧，用户发“今日幸运值”，就触发这个幸运值插件。

```rust
#[kovi::plugin]
async fn main() {
    P::on_msg(|event| async move {
        if event.borrow_text() != Some("今日幸运值") {
            return;
        }

        todo!()
    });
}
```

如果想要监听多个文本要怎么做呢，

例如这些都可以触发： "今日幸运值"、"幸运值"、"获取幸运值"

看看这个

```rust
use kovi::{Message, PluginBuilder as P};

#[kovi::plugin]
async fn main() {
    P::on_msg(|event| async move {
        let msgs = [
            Message::from("今日幸运值"),
            Message::from("幸运值"),
            Message::from("获取幸运值"),
        ];

        if !msgs.contains(&event.message) {
            return;
        }
    });
}
```

使用 msgs.contains() 就可以方便的检查多个条件
