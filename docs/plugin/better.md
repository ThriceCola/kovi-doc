# Kovi 给你提供更好的开发体验

## 大名鼎鼎的异步运行时 `tokio`

Kovi 帮忙导出了 `tokio` 。

在插件的依赖里面不需要写 `tokio` 了，应该使用 ```use kovi::tokio;```

## 帮忙导出一些常用依赖

介于有些写 bot 的依赖过于常用，Kovi 帮忙导出了。（因为 Kovi 框架里面也在用，所以顺便导出一下）

```rust
pub use chrono;
pub use croner;
pub use futures_util;
pub use log;
pub use regex;
pub use serde;
pub use serde_json;
pub use tokio;
pub use toml;
```