# 基础

> [!NOTE] 小提示
> 如果没有看快速上手的话，还是建议看一下的。

## Bot 实例

### 驱动器

Kovi 通过驱动器去适配不一样的服务端, 现在先直接用就好了，不要给自己带来太多学习负担，普通的插件开发者其实也不需要了解这一部分就可以直接愉快的使用 Kovi ，所以这一部分等到文档后面再讲。

### Bot 实例

推荐的方式是使用 `build_bot!()` 宏。它会帮你解决大部分无需在意的事情。如果是第一次运行，它会要求在控制台输入相关的信息，以便可以创建 Bot 实例。并且会将信息储存在文件 `kovi.conf.json` 里面。

通过在 `build_bot!()` 传入插件的 crate 名称，它会帮助你挂载插件。

`build_bot!()` 返回一个 Bot 实例。

```rust
use kovi::tokio;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let driver_config = kovi_onebot::load_local_conf()?;
    let driver = kovi_onebot::OneBotDriver::new(driver_config);

    let bot = kovi::build_bot!(driver; kovi_plugin_cmd);

    bot.run().await;
    Ok(())
}
```

可以选择不传入任何插件。这时 Kovi 不会有任何功能。

当然，也可以自己创建 Bot 实例，**Kovi 的理念倡导减少各种宏带来的理解负担**，但是这需要你手动做很多事情。

```rust
use kovi::tokio;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let driver_config = kovi_onebot::load_local_conf()?;
    let driver = kovi_onebot::OneBotDriver::new(driver_config);

    let kovi_config = kovi::load_local_conf().expect("Failed to load kovi config");

    kovi::logger::try_set_logger_use_env();

    let mut bot = kovi::Bot::build(kovi_config, driver);

    let plugin_set = {
        let mut set = kovi::plugin::plugin_set::PluginSet::new();
        let plugin = kovi_plugin_cmd::get_plugin();
        set.push(plugin);
        set
    };

    bot.mount_plugin_set(plugin_set);

    bot.set_plugin_startup_use_file_ref();

    bot.run().await;
    Ok(())
}
```

这里 Kovi 还提供一个简单的宏 `plugins!()`, 下面代码两个插件集是等价的。

```rust
let set_a = {
    let mut set = kovi::plugin::plugin_set::PluginSet::new();
    let plugin = kovi_plugin_cmd::get_plugin();
    let hi = hi::get_plugin();
    set.push(plugin);
    set.push(hi);
    set
};

let set_b = plugins!(kovi_plugin_cmd, hi);

assert_eq!(set_a, set_b);
```

### 运行 Bot

运行 Bot 很简单 ，就是拥有了一个 Bot 实例后，直接 `bot.run()` 即可。

```rust
bot.run().await;
```


## 插件

拥有结构管理是非常好的习惯，所以推荐的插件开发方法是创建新目录 `./plugins` 储存插件。

通过 `kovi-cli` 或者 `cargo` 可以很好的去构建插件， cargo 的工作区可以使插件开发更加便捷。具体可看[快速上手#插件开发](/start/fast#_3-插件开发)。

通过 `PluginBuilder` 使得插件 crate 可以使用 `plugin` 的各种功能。比如 `PluginBuilder::on_msg` 监听消息事件。

为了方便使用，推荐把 `PluginBuilder` 重命名成 `plugin` 或者 `P`

```rust
use kovi::PluginBuilder as plugin;
use kovi_onebot::*;

#[kovi::plugin]
async fn my_plugin_main() {
    plugin::on_msg(|event| async move {
        todo!();
    })
}
```

> [!CAUTION]
>
> PluginBuilder 只能在插件入口函数中使用。如果在其他地方使用，会导致运行时出错，出错原因是没有 PluginBuilder 实例。
>
> 以下代码会在运行时出错。
>
> ```rust
> use kovi::{log::info, PluginBuilder as plugin};
> use kovi_onebot::*;
>
> #[kovi::plugin]
> async fn main() {
>     plugin::on_msg(|event| async move {
>         plugin::cron("* * * * *", || async move { // 这里会出错
>             info!("我会出错");
>         })
>         .unwrap();
>     });
> }
> ```
>
> 这防止了一些逻辑错误，谁知道会不会有人写出，来一次消息，注册一次监听事件呢？
>

::: tip 你可能想要知道的

### 关于 ```#[kovi::plugin]``` 宏做了什么呢？

它展开后，会创建一个公开函数，通过这个函数，可以获取到插件 crate 的 `name` 和 `version`。这是 `build_bot!()` 所需的信息。

因为插件是异步函数，所以它会帮你做一些额外操作（ `Box::pin()` ），以便于 `Kovi` 去运行。

:::
