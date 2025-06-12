# Bot 启动时插件控制

在 0.11 版本以后，Bot可以控制插件是否在启动时启动了。

如果需要定制bot，才推荐使用这个功能。除此之外，建议不要使用这个功能。因为 `build_bot!()` 宏里已经调用过这个了。

***

如果你使用了 `build_bot!()` 宏，在宏的内部，已经使用了 `bot.set_plugin_startup_use_file_ref();`，这会在当前目录里获取 kovi.plugin.toml 里关于插件的信息。

***

例子：

```rust
use kovi::build_bot;

fn main() {
    // 启动所有插件
    let bot = build_bot!().set_all_plugin_startup(true);
    bot.run()
}
```

更多的方法可以查看 [RustDoc](https://docs.rs/kovi/latest/kovi/bot/struct.Bot.html) 的 Bot 结构体下面有什么，这里不再复述。
