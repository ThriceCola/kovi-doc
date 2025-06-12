# 自定义 Event

其实自定义事件也如Kovi写插件一样简单。

只需要实现一个 trait 就行了

先来看看源码吧

```rust
/// 满足此 trait 即可在Kovi运行时中监听并处理
///
/// # Warning !!!!!
///
/// 请不要阻塞解析事件，如果目标信息需要阻塞获取，请通知用户由用户处理，而非由事件解析器阻塞
pub trait Event: Any + Send + Sync {
    /// 解析事件
    ///
    /// 传入三个东西，按需所取。
    ///  - InternalEvent 内部消息，包含OneBot消息与由框架发出去的Api消息
    ///  - 借用的bot信息，可以通过 `BotInformation` 获取 `Bot` 相关的信息，例如管理员是谁。
    ///  - 借用的api发送通道，可以通过 `api_tx.clone()` 来让事件可以发送 api
    ///
    /// 如果认为此 json 不符合事件要求，请返回 `None`。
    ///
    /// 在一个消息周期内，Kovi 运行时会缓存此事件。
    ///
    /// 不需要的信息用 `_` 忽略，例如：
    ///
    /// ```
    /// impl Event for LifecycleEvent {
    ///     fn de(
    ///         event: &InternalEvent,
    ///         _: &BotInformation,
    ///         _: &tokio::sync::mpsc::Sender<ApiAndOneshot>,
    ///     ) -> Option<Self>
    ///     where
    ///         Self: Sized,
    ///     {
    ///         let InternalEvent::OneBotEvent(json_str) = event else {
    ///             return None;
    ///         };
    ///         let event: LifecycleEvent = serde_json::from_str(json_str).ok()?;
    ///         if event.meta_event_type == "lifecycle" {
    ///             Some(event)
    ///         } else {
    ///             None
    ///         }
    ///     }
    /// }
    /// ```
    ///
    /// # Warning !!!!!
    ///
    /// 请不要阻塞解析事件，如果目标信息需要阻塞，请通知用户由用户处理，而非由事件解析器阻塞。
    ///
    /// 类似于 `MsgSendFromKoviEvent` 的实现，将所需的交给用户就行。
    ///
    /// ```
    /// pub struct MsgSendFromKoviEvent {
    ///     pub event_type: MsgSendFromKoviType,
    ///     pub send_api: SendApi,
    ///     pub res: Result<ApiReturn, ApiReturn>,
    /// }
    /// ```
    fn de(
        event: &InternalEvent,
        bot_info: &BotInformation,
        api_tx: &tokio::sync::mpsc::Sender<ApiAndOneshot>,
    ) -> Option<Self>
    where
        Self: Sized;
}
```

噢噢噢，你好棒，这个网页上什么都没说明，单单看源码你就明白了，夸夸你。

如果你的事件里，使用 api_tx 这个东西，你可以试试实现这个 trait ：

```rust
/// 实现这个 trait, 让用户方便地发送 API 的方法。
pub trait CanSendApi {
    fn __get_api_tx(&self) -> &mpsc::Sender<ApiAndOneshot>;

    /// 发送拓展 Api, 此方法不关注返回值，返回值将丢弃。
    ///
    /// 如需要返回值，请使用 `send_api_return()`
    ///
    /// # Arguments
    ///
    /// `action`: 拓展 Api 的方法名
    ///
    /// `params`: 参数
    fn send_api(&self, action: &str, params: Value) {
        let send_api = SendApi::new(action, params);
        send_api_request_with_forget(self.__get_api_tx(), send_api)
    }
    /// 发送拓展 Api, 此方法关注返回值。
    ///
    /// 如不需要返回值，推荐使用 `send_api()`
    ///
    /// # Arguments
    ///
    /// `action`: 拓展 Api 的方法名
    ///
    /// `params`: 参数
    fn send_api_return(
        &self,
        action: &str,
        params: Value,
    ) -> impl std::future::Future<Output = Result<ApiReturn, ApiReturn>> {
        let send_api = SendApi::new(action, params);
        send_api_request_with_response(self.__get_api_tx(), send_api)
    }
}
```
