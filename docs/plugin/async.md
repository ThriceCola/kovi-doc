# 异步

Rust 提供了两种并发模型：多线程和异步。

对于绝大部分情况，多线程是很有用的，所以 Kovi 默认提供同步运行。

如果你的插件里面有很高的 IO 并发，或者想要使用 `tokio` 的生态，Kovi 可以提供 `tokio` 运行时。

# tokio

Kovi 帮忙导出了 `tokio` 。

在插件的依赖里面不需要写 `tokio` 了，应该使用 ```use kovi::tokio;```

# 插件上的异步

关于如何在 `Kovi` 的插件上使用异步，直接在插件的main函数上使用 `async` 关键字即可。

```rust
#[kovi::plugin]
pub async fn main(mut p: PluginBuilder) { // [!code focus]
}
```

```#[kovi::plugin]``` 宏会帮你把异步所需的配置做好。

挂载异步插件的方式会与同步插件不同。

```rust
use kovi::build_bot;

fn main() {
    let bot = build_bot!(async(async_test)); // [!code focus]
    bot.run()
}
```

当然，`build_bot!` 支持同时挂载同步插件和异步插件。

只不过由于 Rust 宏的限制。你需要这样做：

```rust
let bot = build_bot!(async(async_aaa, async_bbb) & sync_ccc, sync_ddd);
```

同步插件和异步插件需要分开放置，中间使用 `&` 间隔，且异步插件需要使用 `async()` 进行标识。

前后循序无关。

```rust
let bot = build_bot!(sync_aaa, sync_bbb & async(async_ccc, async_ddd));
```
