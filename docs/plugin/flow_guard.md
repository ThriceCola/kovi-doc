# FlowGuard 流程守卫

FlowGuard 流程守卫是通过 自定义 Event 实现的。

这是一个 Kovi 拓展插件的 自定义 Event，通过这个来加入你的插件。

```shell
cargo add --git https://github.com/kovi-plugins/event-engine.git kovi-plugin-event-engine -p <NAME>
```

流程守卫正如它的名字一样，它可以用于流程管控，可以等待其他的接受相同事件的监听闭包的通知，以及传过来的值

通过这个监听方法来使用它

```rust
use kovi_plugin_event_engine::event::FlowGuard;

#[kovi::plugin]
async fn main() {
    P::on(move |e: Arc<FlowGuard<MsgEvent>>| async move {
        e.send("notice");

        e.wait("notice").await.unwrap();

        let msg_event = &e.value;

        msg_event.reply("msg");
    })
}
```

你可以在不同的监听，甚至不同的插件来使用它，实现多插件互通。

它也可以用来传任意值：

```rust
#[kovi::plugin]
async fn main() {
    P::on(move |e: Arc<FlowGuard<MsgEvent>>| async move {
        e.send_value("notice", String::from("我是一个值"));

        let ctx = e.wait("notice").await.unwrap().unwrap();

        let msg = ctx.downcast_ref::<String>().unwrap();

        assert_eq!(msg, "我是一个值");

        let msg_event = &e.value;

        msg_event.reply(msg);
    })
}
```

我不希望有人频繁使用它，因为频繁使用的话，会导致逻辑上的混乱。所以呢，我把它放到 git 上，而不是 crates.io 。如果你有一个插件需要给别人用，这个东西也可能会导致一些奇怪事情的发生。
