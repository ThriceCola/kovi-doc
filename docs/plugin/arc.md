# 无畏并发

> [!WARNING] 警告
> 此篇文章写于旧版本 Kovi ，其中的例子不可以直接用于新版本 Kovi。
> 

[[toc]]

## 前言

多线程并发是 Rust 的基础知识之一，Rust 能对你的多线程保驾护航。因为 Kovi 框架监听消息是一定会用到闭包与多线程的，所以这里要提一嘴。

如果你学习过并发相关内容，可以跳过本章节。

还记得前文的生命周期吗，Kovi 会在启动时将所有插件的 `main()` 函数运行一遍。所有写在 `main()` 函数里的[监听闭包](onevent)都是惰性的，只会在消息来的那一刻运行一次。而这时， `main()` 函数可能早已运行结束。 `main()` 所有变量，会在 `main()` 结束的那一刻丢弃。

> 关于更多无畏并发，你可以查看这个。
>
> [Rust 程序设计语言 - 无畏并发](https://kaisery.github.io/trpl-zh-cn/ch16-00-concurrency.html)


## move 关键字捕获变量

下面代码因为 `bot` 变量属于 `main()` ，所以闭包内无法使用闭包外的变量。

```rust 
//此代码不可编译 // [!code focus]
use kovi::PluginBuilder; 

#[kovi::plugin]
pub fn main(mut p: PluginBuilder) {
    let bot = p.build_runtime_bot();  // [!code focus]
    p.on_msg(|e| { // [!code focus]
        bot.send_private_msg(bot.main_admin, "msg"); // [!code error] // [!code focus]
    }) // [!code focus]
}
```

编译器报错

```
error[E0373]: closure may outlive the current function, but it borrows `bot`, which is owned by the current function
 --> plugins/testkovi/src/lib.rs:7:14
  |
7 |     p.on_msg(|e| {
  |              ^^^ may outlive borrowed value `bot`
8 |         bot.send_private_msg(bot.main_admin, "msg");
  |         --- `bot` is borrowed here
  |
note: function requires argument type to outlive `'static`
```

你可以通过 `move` 关键字来捕获闭包外的变量。此变量便归此闭包所有。

```rust 
use kovi::PluginBuilder; 

#[kovi::plugin]
pub fn main(mut p: PluginBuilder) {
    let bot = p.build_runtime_bot();  // [!code focus]
    p.on_msg(move |e| { // [!code ++] // [!code focus]
        bot.send_private_msg(bot.main_admin, "msg"); // [!code focus]
    }) // [!code focus]
}
```

## Arc 共享状态

学习了上面的 `move` 后，接下来我们看看如何在多个闭包里面使用同一个 `RuntimeBot`。

下面代码因为 `bot` 被第一个闭包捕获了，所以第二个闭包不能使用 `bot`。

```rust
//此代码不可编译 // [!code focus]
#[kovi::plugin]
pub fn main(mut p: PluginBuilder) {
    let bot = p.build_runtime_bot();  // [!code focus]
    p.on_msg(move |e| {  // [!code focus]
        bot.send_private_msg(bot.main_admin, "msg");  // [!code focus]
    });  // [!code focus]
    p.on_msg(move |e| {  // [!code focus]
        bot.send_private_msg(bot.admin[0], "msg"); // [!code error] // [!code focus]
    })  // [!code focus]
}
```

`Arc` 是 Rust 提供的一种原子引用计数指针，它可以让你的变量在多线程里面运行。

每引用一次 `Arc` 包裹的变量，计数便会增加 1 ，当计数为 0 时，该变量才会被抛弃。

所以应该这样写

```rust
use kovi::PluginBuilder;
use std::sync::Arc; // [!code ++] // [!code focus]

#[kovi::plugin]
pub fn main(mut p: PluginBuilder) {
    let bot = Arc::new(p.build_runtime_bot()); // [!code ++] // [!code focus:13]
    p.on_msg({
        let bot = bot.clone(); // [!code ++]
        move |e| {
            bot.send_private_msg(bot.main_admin, "msg");
        }
    });
    p.on_msg({
        let bot = bot.clone(); // [!code ++]
        move |e| {
            bot.send_private_msg(bot.admin[0], "msg");
        }
    })
}
```

## Mutex 互斥器

上面代码共享的 `Bot` 是不需要修改的，如果我们修改一个变量，那 Rust 编译器就会给我们警告了。

下面代码展示了，想要修改一个变量的错误示例。

```rust
// 下面代码不可编译 // [!code focus]
#[kovi::plugin]
pub fn main(mut p: PluginBuilder) {
    let event_vec = Arc::new(Vec::new()); // [!code focus:13]
    p.on_msg({
        let event_vec = event_vec.clone();
        move |e| {
            event_vec.push(e.clone()); // [!code error] 
        }
    });
    p.on_msg({
        let event_vec = event_vec.clone();
        move |e| {
            event_vec.push(e.clone()); // [!code error] 
        }
    })
}
```

编译器报错

```
error[E0596]: cannot borrow data in an `Arc` as mutable
  --> plugins/testkovi/src/lib.rs:10:13
   |
10 |             event_vec.push(e.clone());
   |             ^^^^^^^^^ cannot borrow as mutable
   |
   = help: trait `DerefMut` is required to modify through a dereference, but it is not implemented for `Arc<Vec<AllMsgEvent>>`
```

同时修改一个变量的行为是糟糕的，这会发生不可预测的事情。所以 Rust 不允许这样做。

如何才能让代码正确呢。

`Mutex` 互斥器一次只允许一个线程访问数据。所有线程会按照前后请求访问循序，依次访问数据。

来修改一下代码：

```rust
use kovi::PluginBuilder;
use std::sync::{Arc, Mutex};

#[kovi::plugin]
pub fn main(mut p: PluginBuilder) { // [!code focus:13]
    let event_vec = Arc::new(Mutex::new(Vec::new())); // [!code ++]
    p.on_msg({
        let event_vec = event_vec.clone();
        move |e| {
            event_vec.lock().unwrap().push(e.clone()); // [!code ++]
        }
    });
    p.on_msg({
        let event_vec = event_vec.clone();
        move |e| {
            event_vec.lock().unwrap().push(e.clone()); // [!code ++]
        }
    })
}
```

除了 `Mutex` 访问互斥器，还有 `RwLock` 读写互斥器。

`Mutex` 只允许有一个线程获得它。其它线程都得排队。

你可以尝试 `RwLock` ，这是一个多读单写的互斥器。允许多个线程读。但是写的时候不允许第二个线程访问。

注意 Rust 的 `RwLock` 是读优先的。一个数据如果已经有个线程 A 读，然后有一个线程 B 在排队等待写入，它的后面有一个线程 C 来读，这个线程 C 是比写的线程 B 先读到数据。A 和 C 一起读。如果一直有线程 DEFG... 来读的话，那想要写的线程 B 要排队到天荒地老了，只有在所有读线程都读完，才会轮到写！

两者到底使用谁，如果不清楚的话，那就使用 `Mutex` 最好。

## 多线程并发的危险

尽可能早的释放锁。这样不仅可以让排队的线程更快的访问到数据，且减少了死锁的可能。尽量做到随锁随放。

下面是两种随锁随放的例子：

```rust
pub fn main(mut p: PluginBuilder) {
    let event_vec = Arc::new(Mutex::new(Vec::new()));
    p.on_msg({
        let event_vec = event_vec.clone();
        move |e| { // [!code focus:6]
            { // [!code ++]
                //使用作用域来让锁及时释放。
                let mut event_vec_lock = event_vec.lock().unwrap();
                event_vec_lock.push(e.clone());
            } // [!code ++]
        }
    });
    p.on_msg({
        let event_vec = event_vec.clone();
        move |e| { // [!code focus:6]
            let mut event_vec_lock = event_vec.lock().unwrap();
            event_vec_lock.push(e.clone());
            drop(event_vec_lock); // [!code ++] //使用 drop() 来让锁及时释放。
        }
    });
}
```

两条线程互相请求对方拥有的资源，会导致死锁。这是必须要注意的。可以搜索学习，这里不再赘述。