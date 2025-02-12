# 框架级访问控制

写插件写多了，会发现有几个痛点，几乎所有的插件都需要实现一个黑白名单功能，每次在各个插件写同一个功能，实在是让人难受。所以 Kovi 在 `0.11` 版本加入了框架级访问控制。

***

先说一下 框架级访问控制 与 单一插件内部实现黑白名单 有什么区别。

单一插件内部实现黑白名单（下面简称 插件内名单）实现的时候，一般都是在监听闭包内检查用户是否符合要求。所以可以想怎样实现就怎样实现。而 框架级访问控制 ，会从框架处屏蔽掉插件全部监听。

***

```rust
use kovi::PluginBuilder as P;
use kovi::bot::AccessControlMode;

#[kovi::plugin]
async fn main(){
    let bot = P::get_runtime_bot();

    bot.set_plugin_access_control_mode("my-plugin", AccessControlMode::WhiteList).unwrap();
}
```

更多方法可以查看 [RustDoc 的 RuntimeBot 结构体](https://docs.rs/kovi/latest/kovi/bot/runtimebot/struct.RuntimeBot.html)下面有什么，这里不再复述。

此功能可以通过 feature 里的 `save_plugin_status` 将数据保存到程序运行目录下的 `kovi.plugin.toml`

如果要关闭这个功能，你需要关闭这个特性。
