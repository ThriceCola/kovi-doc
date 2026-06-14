# RuntimeBot

通过 `PluginBuilder::get_runtime_bot()` 可以获取到 `RuntimeBot` ，里面可以获取到 `Bot` 的信息，以及发送 API。

[[toc]]

## RuntimeBot 结构体

```rust
pub struct RuntimeBot {
    pub main_admin: i64, /// 主管理员
    pub admin: Vec<i64>, /// 副管理员，不包含主管理员
    pub api_tx: mpsc::Sender<ApiOneshot>, /// 不推荐的 api 发送方式，请改用 bot.send_api() 发送api。
}
```

## 如何构建 RuntimeBot

```rust
#[kovi::plugin]
async fn main() { 
    let bot = PluginBuilder::get_runtime_bot(); // [!code focus]
}
```


> [!WARNING]
> `PluginBuilder` 只能在插件入口处，也就是由 `#[kovi::plugin]` 标注的函数的这个主线程中使用。请不要在监听闭包里使用 `PluginBuilder::get_runtime_bot();` 监听闭包不属于插件主线程。
> 


## 封装了什么 API

所有的标准 OneBot v11 API 和 Milky API 都已经封装对应的适配器里

在通过下面这些代码引入时, 适配器会自动将 API 封装到 `RuntimeBot` 里。
```rust
use kovi_onebot::*;
use kovi_milky::*;
```


如果需要自行发送服务端的拓展 API，可以使用 `bot.send_api()` 和 `bot.send_api_return()` 。

### 查看不同驱动器有什么api吧

---

<div class="box">
  <a href="/api/onebot_api">
    <p>OneBot</p>
  </a>
  <a href="/api/milky_api">
    <p>Milky</p>
  </a>
</div>

## 拓展 API

拓展 Api 可以通过 Kovi 的一些拓展插件来获取。

如：使用 [kovi-plugin-expand-napcat](https://crates.io/crates/kovi-plugin-expand-napcat) 获取 [NapCat](https://github.com/NapNeko/NapCatQQ) 的拓展。


一种是无需关注返回值的 API，另一种是需要关注返回值的 API。

如下

```rust
let bot = PluginBuilder::get_runtime_bot()
let params = json!({
    "some_user_id":123,
    "some_group_id":123,
});
bot.send_api("some_api", params);
```

```rust
let bot = PluginBuilder::get_runtime_bot()
let params = json!({
    "some_user_id":123,
    "some_group_id":123,
});
let api_return = bot.send_api_return("some_api", params).expect("意外出错");
```





<style>
.box {
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    gap: 32px;
    justify-content: center;
}

.box a {
    position: relative;
    border-radius: 12px;
    box-sizing: border-box;
    border: 1px solid var(--vp-c-divider);
    background-color: var(--vp-c-bg-soft);
    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    height: 100px;
    width: 200px;
    transition: all 0.3s;
    word-break: break-all;
    text-decoration: none;

    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
}

.box a:hover {
    border: 1px solid var(--vp-c-brand-1);
    background-color: var(--vp-c-bg-mute);
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    transform: translateY(-1px);
}

.box a p {
    margin: 0;
    font-weight: 700;
    font-size: 22px;
    color: var(--vp-c-text-1);
    text-align: center;
}

.box a::after {
    content: "➞";
    position: absolute;
    bottom: 8px;
    right: 10px;
    font-size: 30px;
    color: var(--vp-c-text-3);
    opacity: 0;
    transition: all 0.3s;
}

.box a:hover::after {
    opacity: 0.6;
}
</style>
