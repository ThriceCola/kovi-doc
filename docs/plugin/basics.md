# 基础

::: tip 提示
如果没有看快速上手的话，还是建议看一下的。
:::

## 创建 Bot 实例

推荐的方式是使用 `build_bot!()` 宏。`build_bot!()` 会帮你解决大部分无需在意的事情。如果是第一次运行，它会要求在控制台输入相关的信息，以便可以创建bot实例。并且会将信息储存在文件 `kovi.conf.json` 里面。

通过在 `build_bot!()` 传入插件的 crate 名，`build_bot!()` 会帮助你挂载插件。

`build_bot!()` 返回一个bot实例。

```rust
use kovi::build_bot;

fn main() {
    let bot = build_bot!(hi,hi2,plugin123);
}
```

::: tip 小提示
#### `build_bot!()` 帮你做了什么呢？

1. 生成 `kovi.conf.json` 。
2. 使用 `env_logger` 库初始化了 log。
3. 根据传入的 crate ，展开挂载 crate 的 main 函数。
4. 传出一个 bot 实例

可以选择不传入任何插件。这时 Kovi 不会有任何功能。
:::

## 运行bot

运行 bot 很简单 ，就是拥有了一个 bot 实例后，直接 `bot.run()` 即可。

在 `run()` 时，此方法会直接阻塞。但是你可以在 `build_bot!()` 与 `bot.run()` 之间做你想要做的事情

```rust
use kovi::build_bot;

fn main() {
    let bot = build_bot!(hi,hi2,plugin123);
    bot.run()
}
```

## 插件

拥有结构管理是非常好的习惯，所以推荐的插件开发方法是创建新目录 `plugins` 储存插件

通过 Cargo 可以很好的去构建插件，Cargo的工作区可以使插件开发更加便捷。具体可看[快速上手#插件开发](/fast#插件开发)

关于 ```#[kovi::plugin]``` 宏做了什么呢？它展开后，会创建一个公开函数，通过这个函数，可以获取到插件 crate 的 name 和 version。这是 `build_bot!()` 所需的信息。

通过在 `main()` 里要求传入 `plugin: PluginBuilder` 使得插件 crate 可以使用 `plugin` 的各种功能。比如 `plugin.on_msg` 监听消息事件

```rust
use kovi::PluginBuilder;

#[kovi::plugin]
pub fn main(mut plugin: PluginBuilder) {
}
```