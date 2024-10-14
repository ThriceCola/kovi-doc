# 基础

> [!NOTE] 小提示
> 如果没有看快速上手的话，还是建议看一下的。

## 创建 Bot 实例

推荐的方式是使用 `build_bot!()` 宏。`build_bot!()` 会帮你解决大部分无需在意的事情。如果是第一次运行，它会要求在控制台输入相关的信息，以便可以创建 Bot 实例。并且会将信息储存在文件 `kovi.conf.json` 里面。

通过在 `build_bot!()` 传入插件的 crate 名称，`build_bot!()` 会帮助你挂载插件。

`build_bot!()` 返回一个 Bot 实例。

```rust
use kovi::build_bot;

fn main() {
    let bot = build_bot!(hi, hi2, plugin123);
}
```

::: tip 你可能想要知道的

### `build_bot!()` 帮你做了什么呢？

1. 生成 `kovi.conf.json` 。
2. 使用 `env_logger` 库初始化了 `logger` （需启用 `logger` 特性，`logger` 目前默认启用）。
3. 根据传入的 crate 名称，展开挂载 crate 的 `main` 函数。
4. 传出一个 Bot 实例

可以选择不传入任何插件。这时 Kovi 不会有任何功能。

:::

当然，也可以自己创建 Bot 实例，但是这需要你手动做很多事情。

```rust
use kovi::bot::{KoviConf, Server};
use std::{
    net::{IpAddr, Ipv4Addr},
    sync::Arc,
};

fn main() {
    let conf_a: KoviConf = kovi::bot::Bot::load_local_conf();

    let conf_b: KoviConf = KoviConf::new(
        10000,
        None,
        Server {
            host: IpAddr::V4(Ipv4Addr::new(127, 0, 0, 1)),
            port: 8081,
            access_token: "".to_string(),
        },
        false,
    );

    kovi::logger::try_set_logger();

    let mut bot = kovi::Bot::build(conf_b);

    let (plugin_name, plugin_version) = testkovi::__kovi_get_plugin_info();

    bot.mount_main(
        plugin_name,
        plugin_version,
        Arc::new(testkovi::__kovi_run_async_plugin),
    );

    bot.run();
}
```


## 运行 Bot

运行 Bot 很简单 ，就是拥有了一个 Bot 实例后，直接 `bot.run()` 即可。

`bot.run()` 是阻塞的，并且接管了整个程序，程序不会运行写在 `bot.run()` 后的任何代码。但是你可以在 `build_bot!()` 与 `bot.run()` 之间做你想要做的事情。

```rust
use kovi::build_bot;

fn main() {
    let bot = build_bot!(hi, hi2, plugin123);
    bot.run()
}
```

## 插件

拥有结构管理是非常好的习惯，所以推荐的插件开发方法是创建新目录 `plugins` 储存插件。

通过 `kovi-cli` 或者 `cargo` 可以很好的去构建插件， cargo 的工作区可以使插件开发更加便捷。具体可看[快速上手#插件开发](/start/fast#插件开发)。

通过 `PluginBuilder` 使得插件 crate 可以使用 `plugin` 的各种功能。比如 `PluginBuilder::on_msg` 监听消息事件。

```rust
use kovi::PluginBuilder as plugin;

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

因为插件是异步函数，所以它会帮你做一些额外操作，以便于 `Kovi` 去运行。

:::
