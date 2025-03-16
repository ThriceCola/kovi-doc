# Kovi 给你提供更好的开发体验

## 大名鼎鼎的异步运行时 `tokio`

Kovi 帮忙导出了 `tokio` 。

在插件的依赖里面不需要写 `tokio` 了，应该使用 ```use kovi::tokio;```

## 帮忙导出一些常用依赖

介于有些写 bot 的依赖过于常用，Kovi 帮忙导出了。（因为 Kovi 框架里面也在用，所以顺便导出一下）

```rust
pub use chrono;
pub use croner;
pub use futures_util;
pub use log;
pub use serde_json;
pub use tokio;
pub use toml;

#[cfg(feature = "cqstring")]
pub use regex;
```

## 异步，以及它所带来的开发问题

Kovi 在 0.8.0 版本后已经全面改成异步，这带来的性能的提升，但同时也带来了一些开发上的问题。

### 目前 Rust 2024 版本的异步闭包 AsyncFn 支持还不完善

[异步闭包相关 PR](https://github.com/rust-lang/rust/pull/132706)

在 Rust 1.85 版本之前，Rust 只拥有 `|| async {}` 这种异步闭包，内部的本质其实是**闭包传出异步块**。

在 Rust 1.85 版本之后，Rust 新推出 `AsyncFn` 与 `async || {}` ，这极大的改善了之前丑陋的 `|| async {}` 闭包。

我们先来看看 `|| async {}` 闭包有多丑陋

```rust
use kovi::{log::info, PluginBuilder as P};
use std::sync::Arc;

#[kovi::plugin]
async fn main() {
    let arc = Arc::new("我是共享内存".to_string());

    P::on_msg({
        let arc = arc.clone(); //第一次clone
        move |_e| { //第一次move
            let arc = arc.clone(); //第二次clone
            async move { //第二次move
                info!("我在使用 {arc}");
            }
        }
    });

    P::on_msg({
        let arc = arc.clone(); //第一次clone
        move |_e| { //第一次move
            let arc = arc.clone(); //第二次clone
            async move { //第二次move
                info!("我在使用 {arc}");
            }
        }
    });
}
```

如果需要在闭包与异步块中共享内存，那么你得传递两次 Arc 。

Rust 1.85 新推出的异步闭包解决了这个问题。如今，可以这样写

```rust
// 这段代码暂时不能通过编译
P::on_msg({
    let arc = arc.clone();
    async move |e| {
        info!("我在使用 {arc}");
    }
});
```

很不错，可是很可惜，现在 Kovi 还不能这样写，上述代码不能通过编译。这是因为目前 Rust 对这个新的异步闭包的支持还不完善。 Kovi 内部使用的 Tokio 异步运行时需要约束传入的异步要拥有 `Send` trait。Rust 暂时**还没有稳定**可以约束异步闭包为 `Send` 的语法。也就是说，现在还不能在 Kovi 中使用 AsyncFn 。

新的异步闭包，可以稍微用在现在的 Kovi 里，只是它不能 move 外部的变量。

```rust
P::on_msg(
    async |e| {
        info!("你好，我是异步闭包");
    }
);
```

这段代码是可以编译并且运行的。

目前，请将就一下，或者这里有三个方法可以让代码没那么丑。

#### 1.将逻辑写在单独的 async fn 里面。

这种方法会使代码看起来更加整洁。避免了代码中要写两次move关键字。

```rust
use kovi::{log::info, AllMsgEvent, PluginBuilder as p};
use std::sync::Arc;

#[kovi::plugin]
async fn main() {
    let arc = Arc::new("我是共享内存".to_string());

    p::on_msg({
        let arc = arc.clone();
        move |e| on_msg(e, arc.clone())
    });

    p::on_msg({
        let arc = arc.clone();
        move |e| on_msg(e, arc.clone())
    });
}


async fn on_msg(_e: Arc<AllMsgEvent>, arc: Arc<String>) {
    info!("我在使用 {arc}")
}
```

#### 2.使用 Kovi 提供的 async_move! 宏。

async_move! 宏会隐式的帮你写好两次拷贝两次 move。这会非常的简洁，但是有个缺点，使用 rust-analyzer 或 cargo fmt 时，宏内会无法格式化。

```rust
use kovi::{async_move, log::info, PluginBuilder as p};
use std::sync::Arc;

#[kovi::plugin]
async fn main() {
    let arc = Arc::new("我是共享内存".to_string());

    p::on_msg(async_move!(_e; arc; {
        info!("我在使用 {arc}");
    }));

    p::on_msg(async_move!(_e; arc; {
        info!("我在使用 {arc}");
    }));
}
```

#### 3.使用 Kovi Github 仓库的不稳定Rust版本的分支。

[Kovi AsyncFn 分支链接，点击前往](https://github.com/Threkork/Kovi/tree/rust-2024)

还记得上文提到过为什么不能用 AsyncFn 吗，因为 Rust 暂时**还没有稳定**可以约束异步闭包为 `Send` 的语法。

Kovi 在这个分支里使用 nightly 版本的 Rust，你可以尝试切换到这个分支来使用 `async || {}` 新特性。

首先下载 nightly 版本的 Rust

```sh
rustup install nightly
```

接着把这个项目的 rust 工具链切换到 nightly 版本。

在项目目录的终端输入：

```sh
rustup override set nightly
```

这个命令会将这个目录的项目的 Rust 工具链切换到 nightly 版本

切换回正常版本只需要：

```sh
rustup override unset
```

接着进入到你的 Kovi 项目里的 `Cargo.toml` 里，强制所有的 kovi 依赖为这个 git 分支：

```toml
[patch.crates-io]
kovi = { version = "2025.1.0", git = "https://github.com/Threkork/Kovi.git", branch = "rust-2024" }
```

最好是指定一下哈希，但是文档里也不能确定哈希是多少，请你自己去这个仓库里看一下，接着指定就好了

```toml
[patch.crates-io]
kovi = { version = "2025.1.0", git = "https://github.com/Threkork/Kovi.git", rev = "80ccf2c" }
```

接着应该就能愉快的使用 全新的异步闭包 功能了。

```rust
use kovi::{log::info, PluginBuilder as P};
use std::sync::Arc;

#[kovi::plugin]
async fn main() {
    let arc = Arc::new("我是共享内存".to_string());

    P::on_msg({
        let arc = arc.clone();
        async move |_e| {
            info!("我在使用 {arc}");
        }
    });

    P::on_msg({
        let arc = arc.clone();
        async move |_e| {
            info!("我在使用 {arc}");
        }
    });
}
```
