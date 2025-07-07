# 准备

希望你是想要通过 Kovi 来学习 Rust ，或者是为了 Rust 来使用 Kovi , 不要为了 Kovi 而来使用 Kovi 。

1. Kovi 由 [Rust](https://www.rust-lang.org/) 所写，插件也需用 [Rust](https://www.rust-lang.org/) 写，请确保本地已安装。

2. 虽然 Kovi 上手非常简单，但是 Kovi 需要使用 [Rust](https://www.rust-lang.org/) 进行开发，请确保你拥有 [Rust](https://www.rust-lang.org/) 基础，至少需要掌握多线程共享状态和异步，才能较为轻松的开发 Kovi 插件。

3. Kovi 版本控制非常激进，Kovi 将始终使用最新的 Rust 稳定版特性，请保证你的 Rust 版本为最新的。

4. Kovi 只是一个 [OneBot](https://onebot.dev/) 插件开发框架，你需要准备 OneBot V11 服务端。如果没有的话，需要找找，并部署起来。

5. 将你的 OneBot V11 服务端，配置成正向 WebSocket 模式。


> [!TIP] 提示
> `Kovi` 目前只支持 OneBot V11 正向 WebSocket 协议。
