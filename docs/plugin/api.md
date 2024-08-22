# API 列表

[[toc]]

## Kovi 处理返回值的 API

### `bot.send_group_msg_return()` 发送群组消息, 并返回消息 ID

向指定的群组发送消息，并返回消息的 ID。

#### 参数

- `group_id`: 目标群组的 ID。
- `msg`: 要发送的消息内容。

#### 返回

- `Result<i32, ApiError>`: 如果操作成功，将返回消息的 ID，类型为 `i32`。如果操作失败，将返回 `ApiError`。

***

### `bot.send_private_msg_return()` 发送私聊消息, 并返回消息 ID

向指定用户发送私聊消息，并返回消息的 ID。

#### 参数

- `user_id`: 目标用户的 ID。
- `msg`: 要发送的消息内容。

#### 返回

- `Result<i32, ApiError>`: 如果操作成功，将返回消息的 ID，类型为 `i32`。如果操作失败，将返回 `ApiError`。

***

### `bot.can_send_image()` 是否能发送图片

检查当前账号是否能够发送图片。

#### 返回

- `Result<bool, ApiError>`: 如果操作成功，将返回 `bool` 类型的结果，`true` 表示可以发送图片，`false` 表示不能发送图片。如果操作失败，将返回 `ApiError`。

***

### `bot.can_send_record()` 是否能发送语音

检查当前账号是否能够发送语音消息。

#### 返回

- `Result<bool, ApiError>`: 如果操作成功，将返回 `bool` 类型的结果，`true` 表示可以发送语音，`false` 表示不能发送语音。如果操作失败，将返回 `ApiError`。

***

### `bot.get_cookies()` 获取 Cookies

获取指定域名的 Cookies。

#### 参数

- `domain`: 需要获取 Cookies 的域名。

#### 返回

此方法会返回一个 `String` 类型的 Cookies 值。

***

### `bot.get_csrf_token()` 获取 CSRF Token

获取 CSRF Token。

#### 返回

此方法会返回一个 `i32` 类型的 CSRF Token。

***

### `bot.get_record()` 获取语音

获取并转换语音文件。

#### 参数

- `file`: 收到的语音文件名（消息段的 `file` 参数），例如 `0B38145AA44505000B38145AA4450500.silk`。
- `out_format`: 要转换到的格式，支持 `mp3`、`amr`、`wma`、`m4a`、`spx`、`ogg`、`wav`、`flac`，具体请查看 OneBot 服务端。

#### 返回

此方法会返回转换后的语音文件路径，类型为 `String`。

***

### `bot.get_image()` 获取图片

获取指定的图片文件。

#### 参数

- `file`: 收到的图片文件名（消息段的 `file` 参数），例如 `6B4DE3DFD1BD271E3297859D41C530F5.jpg`。

此方法会返回图片文件的路径，类型为 `String`。

## 无返回值的 API

### `bot.send_group_msg()` 发送群组消息

发送群组消息。如果需要返回消息 ID，请使用 `send_group_msg_return()` 方法。

#### 参数

- `group_id`: 目标群组的 ID。
- `msg`: 要发送的消息内容。

***

### `bot.send_private_msg()` 发送私聊消息

发送私聊消息。如果需要返回消息 ID，请使用 `send_private_msg_return()` 方法。

#### 参数

- `user_id`: 目标用户的 ID。
- `msg`: 要发送的消息内容。

***

### `bot.delete_msg()` 撤回消息

撤回指定的消息。

#### 参数

- `message_id`: 要撤回的消息 ID。

***

### `bot.send_like()` 点赞

对指定用户进行点赞。

#### 参数

- `user_id`: 被点赞的用户 ID。
- `times`: 点赞的次数。

***

### `bot.set_group_kick()` 群组踢人

将指定用户从群组中踢出。

#### 参数

- `group_id`: 群组的 ID。
- `user_id`: 被踢出的用户 ID。
- `reject_add_request`: 是否拒绝此人的加群请求。如果传入 `true`，则拒绝此人再次加入该群组。

***

### `bot.set_group_ban()` 群组单人禁言

对群组中的指定用户进行禁言或取消禁言。

#### 参数

- `group_id`: 群组的 ID。
- `user_id`: 需要禁言或取消禁言的用户 ID。
- `duration`: 禁言时长，单位为秒。`0` 表示取消禁言。

***

### `bot.set_group_anonymous_ban_use_anonymous()` 群组匿名用户禁言

对群组中的匿名用户进行禁言或取消禁言。

#### 参数

- `group_id`: 群组的 ID。
- `anonymous`: 要禁言的匿名用户对象（群消息上报的 anonymous 字段）。
- `duration`: 禁言时长，单位为秒。`0` 表示取消禁言。
- `enable`: 是否禁言，传入 `true` 表示禁言，`false` 表示取消禁言。

***

### `bot.set_group_anonymous_ban_use_flag()` 群组匿名用户禁言

对群组中的匿名用户进行禁言或取消禁言。

#### 参数

- `group_id`: 群组的 ID。
- `flag`: 要禁言的匿名用户的标识（需要从群消息上报的数据中获得）。
- `duration`: 禁言时长，单位为秒。`0` 表示取消禁言。
- `enable`: 是否禁言，传入 `true` 表示禁言，`false` 表示取消禁言。

***

### `bot.set_group_whole_ban()` 群组全员禁言

对群组中的所有成员进行禁言或取消禁言。

#### 参数

- `group_id`: 群组的 ID。
- `enable`: 是否禁言，传入 `true` 表示全员禁言，`false` 表示取消禁言。

***

### `bot.set_group_admin()` 群组设置管理员

设置或取消群组中的管理员权限。

#### 参数

- `group_id`: 群组的 ID。
- `user_id`: 需要设置或取消管理员权限的用户 ID。
- `enable`: 是否设置管理员，传入 `true` 表示设置为管理员，`false` 表示取消管理员权限。

***

### `bot.set_group_anonymous()` 群组匿名

设置或取消群组中的匿名状态。

#### 参数

- `group_id`: 群组的 ID。
- `enable`: 是否启用匿名，传入 `true` 表示启用匿名，`false` 表示取消匿名。

***

### `bot.set_group_card()` 设置群名片（群备注）

设置或删除群组中的用户名片（群备注）。

#### 参数

- `group_id`: 群组的 ID。
- `user_id`: 需要设置或删除群名片的用户 ID。
- `card`: 群名片内容。如果不填或传入空字符串，则表示删除群名片。

***

### `bot.set_group_name()` 设置群名

设置群组的新名称。

#### 参数

- `group_id`: 群组的 ID。
- `group_name`: 新的群组名称。

***

### `bot.set_group_leave()` 退出群组

退出指定的群组，或解散群组（如果权限允许）。

#### 参数

- `group_id`: 群组的 ID。
- `is_dismiss`: 是否解散群组。如果登录号是群主，则仅在此项为 `true` 时能够解散群组。

***

### `bot.set_group_special_title()` 设置群组专属头衔

设置或删除群组成员的专属头衔。

#### 参数

- `group_id`: 群组的 ID。
- `user_id`: 需要设置或删除专属头衔的用户 ID。
- `special_title`: 专属头衔内容。传入空字符串表示删除专属头衔。

***

### `bot.set_friend_add_request()` 处理加好友请求

处理收到的加好友请求。

#### 参数

- `flag`: 加好友请求的标识（需从上报的数据中获得）。
- `approve`: 是否同意请求。传入 `true` 表示同意，`false` 表示拒绝。
- `remark`: 添加后的好友备注，仅在同意请求时有效。如果不同意请求，此参数将被忽略。

***

### `bot.set_group_add_request()` 处理加群请求／邀请

处理收到的加群请求或邀请。

#### 参数

- `flag`: 加群请求的标识（需从上报的数据中获得）。
- `sub_type`: 请求类型，`add` 或 `invite`。需与上报消息中的 `sub_type` 字段一致。
- `approve`: 是否同意请求或邀请。传入 `true` 表示同意，`false` 表示拒绝。
- `reason`: 拒绝理由。仅在拒绝时有效。可以为空字符串。

***

### `bot.clean_cache()` 清理缓存

清理积攒的 **OneBot 服务端** 缓存文件。**并非是对于本框架清除**。

## 有返回值的 API

**具体返回了什么值，请查看 [OneBot v11 文档](https://github.com/botuniverse/onebot-11/blob/master/api/public.md) 或者服务端文档**

### `bot.get_msg()` 获取消息

获取指定的消息内容。

#### 参数

- `message_id`: 消息的 ID。

#### 返回

- `Result<Value, ApiError>`: 如果操作成功，将返回消息的内容，类型为 `Value`。如果操作失败，将返回 `ApiError`。

***

### `bot.get_forward_msg()` 获取合并转发消息

获取指定的合并转发消息内容。

#### 参数

- `id`: 合并转发的 ID。

#### 返回

- `Result<Value, ApiError>`: 如果操作成功，将返回合并转发消息的内容，类型为 `Value`。如果操作失败，将返回 `ApiError`。

***

### `bot.get_login_info()` 获取登录号信息

获取当前登录号的信息。

#### 返回

- `Result<Value, ApiError>`: 如果操作成功，将返回当前登录号的详细信息，类型为 `Value`。如果操作失败，将返回 `ApiError`。

***

### `bot.get_stranger_info()` 获取陌生人信息

获取指定陌生人的信息。

#### 参数

- `user_id`: 陌生人的用户 ID。
- `no_cache`: 是否不使用缓存（使用缓存可能更新不及时，但响应更快）。

#### 返回

- `Result<Value, ApiError>`: 如果操作成功，将返回陌生人的详细信息，类型为 `Value`。如果操作失败，将返回 `ApiError`。

***

### `bot.get_friend_list()` 获取好友列表

获取当前登录号的好友列表。

#### 返回

- `Result<Value, ApiError>`: 如果操作成功，将返回好友列表，类型为 `Value`。如果操作失败，将返回 `ApiError`。

***

### `bot.get_group_info()` 获取群信息

获取指定群组的信息。

#### 参数

- `group_id`: 群组的 ID。
- `no_cache`: 是否不使用缓存。传入 `true` 表示不使用缓存（可能获取到更及时的信息但响应较慢），传入 `false` 表示使用缓存（响应较快但信息可能不及时）。

#### 返回

- `Result<Value, ApiError>`: 如果操作成功，将返回群组的详细信息，类型为 `Value`。如果操作失败，将返回 `ApiError`。

***

### `bot.get_group_list()` 获取群列表

获取当前登录号所在的群组列表。

#### 返回

- `Result<Value, ApiError>`: 如果操作成功，将返回群组列表，类型为 `Value`。如果操作失败，将返回 `ApiError`。

***

### `bot.get_group_member_info()` 获取群成员信息

获取指定群组中某个成员的信息。

#### 参数

- `group_id`: 群组的 ID。
- `user_id`: 群组成员的用户 ID。
- `no_cache`: 是否不使用缓存。传入 `true` 表示不使用缓存（可能获取到更及时的信息但响应较慢），传入 `false` 表示使用缓存（响应较快但信息可能不及时）。

#### 返回

- `Result<Value, ApiError>`: 如果操作成功，将返回群成员的详细信息，类型为 `Value`。如果操作失败，将返回 `ApiError`。

***

### `bot.get_group_member_list()` 获取群成员列表

获取指定群组中的所有成员列表。

#### 参数

- `group_id`: 群组的 ID。

#### 返回

- `Result<Value, ApiError>`: 如果操作成功，将返回群成员列表，类型为 `Value`。如果操作失败，将返回 `ApiError`。

***

### `bot.get_group_honor_info()` 获取群荣誉信息

获取指定群组的荣誉信息。

#### 参数

- `group_id`: 群组的 ID。
- `honor_type`: 要获取的群荣誉类型。**本框架已包装好了 `HonorType` 枚举**

#### 返回

- `Result<Value, ApiError>`: 如果操作成功，将返回群荣誉的详细信息，类型为 `Value`。如果操作失败，将返回 `ApiError`。

***

### `bot.get_credentials()` 获取相关接口凭证

获取合并后的接口凭证，包括 Cookies 和 CSRF Token。

#### 参数

- `domain`: 需要获取 Cookies 的域名。

#### 返回

- `Result<Value, ApiError>`: 如果操作成功，将返回合并后的凭证信息，类型为 `Value`。如果操作失败，将返回 `ApiError`。

***

### `bot.get_status()` 获取运行状态

获取当前运行状态的信息。

#### 返回

- `Result<Value, ApiError>`: 如果操作成功，将返回运行状态的详细信息，类型为 `Value`。如果操作失败，将返回 `ApiError`。

***

### `bot.get_version_info()` 获取版本信息

获取当前版本的信息。

#### 返回

- `Result<Value, ApiError>`: 如果操作成功，将返回版本信息的详细数据，类型为 `Value`。如果操作失败，将返回 `ApiError`。

## 拓展 API

如果需要发送服务端的拓展 API，使用 `bot.send_api()` 和 `bot.send_api_return()` 实现。

一种是无需关注返回值的 API，另一种是需要关注返回值的 API。

如下

```rust
let bot = plugin.build_runtime_bot()
let params = json!({
    "some_user_id":123,
    "some_group_id":123,
});
bot.send_api("some_api", params);
```

```rust
let bot = plugin.build_runtime_bot()
let params = json!({
    "some_user_id":123,
    "some_group_id":123,
});
let value = bot.send_api_return("some_api", params).expect("意外出错");
```

