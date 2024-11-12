# kovi-cli

Kovi 拥有一个 Cli 工具，便于开发者管理 KoviBot 项目。

使用 ```cargo install kovi-cli``` 安装即可。

```bash
cargo install kovi-cli
```

|       命令        |     简化     |      功能      |                             选项                              |
| :---------------: | :----------: | :------------: | :-----------------------------------------------------------: |
|  cargo kovi new   | cargo kovi n | 创建 Kovi 项目 |                             None                              |
| cargo kovi create | cargo kovi c | 创建 Kovi 插件 | -s 创建简化代码模板 <br> -p 给插件名称前面增加 `kovi-plugin-` |
|  cargo kovi add   | cargo kovi a | 添加 Kovi 插件 |                  -p 为工作区某一 crate 添加                   |
| cargo kovi update |     None     | 升级 Kovi Cli  |                             None                              |


## 一些额外解释

`cargo kovi add [NAME]` 添加 Kovi 插件。

添加 Kovi 插件。

可以增加 Kovi 本地插件，或者存在于 [crates.io](https://crates.io) 上面的插件。

优先会搜索本地目录下的插件，搜索不到会向 [crates.io](https://crates.io) 搜索。

如

```bash
cargo kovi add like
```

如果你本地的 `plugins` 目录下有 `like` 这一插件。会将此本地插件添加进 根 crate 的依赖中。

如果没有，会将 [crates.io](https://crates.io) 上的 [`kovi-plugin-like`](https://crates.io/crates/kovi-plugin-like) 添加进 根 crate 的依赖中。


> `cargo kovi add like` 等同于 `cargo kovi add kovi-plugin-like`