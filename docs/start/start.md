# 一切的开始

## 理念

Kovi 的口号是 “目标是 Rust 最简单 OneBot 框架！”，这里面意味着什么呢：
- 从你最熟悉的 `main()` 开始写插件，像写小普通程序代码一样，去编写一个 Bot 功能。
- 没有无意义且复杂的宏，Kovi 不会去追求隐藏细节的宏，这会给开发者带来很多负担，Kovi是从代码范式去简化的。Kovi 目前仅提供 4 个真正简单且好用的宏，它们非常易于理解。
- 文档详细且简单直白，只要你跟着文档走，就可以轻松上手。


## 准备

> [!TIP] 提示
> 如有问题请前往 [GitHub Issues](https://github.com/thricecola/Kovi/issues)，或加入 QQ 交流群 [857054777](https://qm.qq.com/q/kmpSBOVaCI)。

希望你是想要通过 Kovi 来学习 Rust ，或者是为了 Rust 来使用 Kovi , 不要为了 Kovi 而来使用 Kovi 。

1. Kovi 由 Rust 所写，插件也需用 [Rust](https://www.rust-lang.org/) 写，请确保本地已安装。

2. 虽然 Kovi 上手非常简单，但是 Kovi 需要使用 Rust 进行开发，请确保你拥有 Rust 基础，至少需要掌握多线程共享状态和异步，才能较为轻松的开发 Kovi 插件。

3. Kovi 版本控制比较激进，Kovi 将始终使用最新的 Rust 稳定版特性，请保证你的 Rust 版本为最新的。

4. Kovi 只是一个插件开发框架，你需要准备服务端。如果没有的话，需要找找，并部署起来。


> [!TIP] 提示
> Kovi 官方目前支持:
> - [Milky 协议](https://milky.ntqqrev.org)
> - [OneBot V11 正向 WebSocket 协议](https://github.com/botuniverse/onebot-11)
> 
> 当然 Kovi 本身允许支持其它协议, 只不过目前官方仅将目光聚焦在这,
> 你可以试试自己支持其它协议
