# Kovi 给你提供更好的开发体验

在开发的时候总是会遇到一些事情要写一大串代码。

为此，Kovi 包装了一些常用的函数和库。

[[toc]]

## 保存读取数据

首先请打开 `utils` feature。目前这是默认打开的。

都储存在 `kovi::utils` 里。

### `load_json_data()` 加载本地json数据

如果本地保存过数据，config会是本地的数据，如果没有本地数据，则返回默认的数据，并且保存一份数据到路经。

```rust
use serde_json::{json, Value};
use kovi::utils::load_json_data;
use kovi::PluginBuilder;

#[kovi::plugin]
pub fn main(p: PluginBuilder) {
    let data_path = p.get_data_path();
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
use kovi::PluginBuilder;

#[kovi::plugin]
pub fn main(p: PluginBuilder) {
    let data_path = p.get_data_path();
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

## 帮忙导出一些常用依赖

介于有些写 bot 的依赖过于常用，Kovi 帮忙导出了。（因为 Kovi 框架里面也在用，所以顺便导出一下）

```rust
pub use chrono;
pub use futures_util;
pub use log;
pub use regex;
pub use serde;
pub use serde_json;
pub use tokio;
pub use toml; //存在于 utils feature，目前是默认打开的。
```