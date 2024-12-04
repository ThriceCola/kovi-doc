# 异步，以及它所带来的开发问题

Kovi 在 0.8.0 版本后已经全面改成异步，这带来的性能的提升，但同时也带来了一些开发上的问题。

## 问题一：目前Rust不支持异步闭包。

[异步闭包相关 PR](https://github.com/rust-lang/rust/pull/132706)

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

## 问题二：不要在 .await 时持有锁。

Rust 标准库的锁调用的是操作系统的锁，是将整个线程给阻塞等待，如果在持有同步锁时去 .await 就会导致在 .await 期间这个线程一直被锁住，这与异步设计相违背。

所以不要在 .await 时持有同步锁。

事实上，Rust 在编写持有同步锁的异步代码时，就会让这段代码失去 Send 特征。这时，因为 Tokio 和 Kovi 都在函数里要求传入的 Future 具备 Send ，所以编译器会报错。

解决方案和详细解释可以查看 tokio 的文档：[tokio](https://tokio.rs/tokio/tutorial/shared-state#holding-a-mutexguard-across-an-await)
