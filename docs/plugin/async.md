# 异步，以及它所带来的开发问题

Kovi 在 0.8.0 版本后已经全面改成异步，这带来的性能的提升，但同时也带来了一些开发上的问题。

## 问题一：目前Rust不支持异步闭包。

AsyncFn 将会在 Rust 2024 版本推出（为什么2024版要2025年出？）。但在现在的 Rust 版本中，我们没有这个东西。

闭包和异步用起来是及其繁琐的。如果需要在闭包与异步块中共享内存，那么你得传递两次 Arc 。不这样的话，会遇到变量不能 move 的问题。这无疑增加了开发难度。

先让我们看看有多丑陋。

```rust
use kovi::{log::info, PluginBuilder as p};
use std::sync::Arc;

#[kovi::plugin]
async fn main() {
    let arc = Arc::new("我是共享内存".to_string());

    p::on_msg({
        let arc = arc.clone(); //第一次clone
        move |_e| { //第一次move
            let arc = arc.clone(); //第二次clone
            async move { //第二次move
                info!("我在使用 {arc}");
            }
        }
    });

    p::on_msg({
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

接下来，有两个方法可以让代码没那么丑。

### 1.将逻辑写在单独的 async fn 里面。

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

### 2.使用 Kovi 提供的 async_move! 宏。

async_move! 宏会隐式的帮你写好两次拷贝两次 move。这会非常的简洁，但是有个缺点，使用 rust-analyzer 时，宏内会无法格式化。

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

## 问题二：异步中，不要在.await时持有锁。

详细可看 tokio 的文档：[tokio](https://tokio.rs/tokio/tutorial/shared-state#holding-a-mutexguard-across-an-await)

