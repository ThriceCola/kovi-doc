# 数据存储

Kovi 希望开发者能有统一的规范。这包括数据存储在何处。

每个插件的数据是推荐存储在 KoviBot 项目的 `./data/[NAME]` 里面的。这保证了各个插件的数据单独存储，也保证了多插件本地数据互通的可能性。

如何便捷的取得属于自己插件的路径呢？

在 `RuntimeBot` 有个方法 `get_data_path()` 可以获取到属于自己插件的路径。

```rust
#[kovi::plugin]
async fn main() {
    let bot = PluginBuilder::get_runtime_bot();
    let data_path = bot.get_data_path();
    let config_json_path = data_path.join("config.json");
    let config_toml_path = data_path.join("config.toml");
}
```

## 保存读取数据

### `load_json_data()` 加载本地json数据

如果本地保存过数据，返回的会是本地的数据，如果没有本地数据，则返回传入的默认的数据，并且保存一份数据到路经。

```rust
use serde_json::{json, Value};
use kovi::utils::load_json_data;
use kovi::PluginBuilder as p;

#[kovi::plugin]
async fn main() {
    let bot = p::get_runtime_bot();
    let data_path = bot.get_data_path();
    let config_path = data_path.join("config.json");
    let default_config: Value = json!({
        "id": "123456",
    });

    // 如果本地保存过数据，config会是本地的数据，如果没有本地数据，则返回默认的数据，并且保存一份数据到路经。
    let config = load_json_data(default_config, config_path).unwrap();
}
```

### `load_toml_data()` 加载本地toml数据

同上

```rust
let default_config = toml! {
    id = "123"
};

let config = load_toml_data(default_config, config_path).unwrap();
```

### `save_json_data()` 保存本地json数据

向传入的地址保存此数据。

```rust
use serde_json::{json, Value};
use kovi::utils::save_json_data;
use kovi::PluginBuilder as p;

#[kovi::plugin]
async fn main() {
    let bot = p::get_runtime_bot();
    let data_path = bot.get_data_path();
    let config_path = data_path.join("config.json");
    let default_config: Value = json!({
        "id": "123"
    });

    // 向本地保存数据
    save_json_data(&default_config, config_path).unwrap();
}
```

### `save_toml_data()` 保存本地tonl数据

同 `save_json_data()`

```rust
let default_config = toml! {
    id = "123"
};

// 向本地保存数据
save_toml_data(&default_config, config_path).unwrap();
```