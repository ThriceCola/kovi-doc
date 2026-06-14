# Milky API 列表

[[toc]]

## ApiReturn 结构体

```rust
pub struct ApiReturn {
    pub status: String,
    pub retcode: i32,
    pub data: Value,
    echo: String, // 私有字段
}
```

## 有返回值的 API

有返回值的 API，Kovi 会帮忙简单判断一下返回的 "status" 是不是 "ok"，如果不是，将会返回 `Err(ApiReturn)`。

**具体返回了什么值，请查看 [Milky 协议端文档](https://github.com/MilkyDevelopers/milky) 或者协议端服务端文档**

### `bot.get_login_info()` 获取登录信息

获取当前登录号的信息。

#### 返回

- `Result<ApiReturn, ApiReturn>`

***

### `bot.get_impl_info()` 获取协议端信息

获取当前协议端的信息。

#### 返回

- `Result<ApiReturn, ApiReturn>`

***

### `bot.get_user_profile()` 获取用户个人信息

获取指定用户的个人信息。

#### 参数

- `user_id`: 目标用户的 ID。

#### 返回

- `Result<ApiReturn, ApiReturn>`

***

### `bot.get_friend_list()` 获取好友列表

获取当前登录号的好友列表。

#### 参数

- `no_cache`: 是否不使用缓存（使用缓存可能更新不及时，但响应更快）。

#### 返回

- `Result<ApiReturn, ApiReturn>`

***

### `bot.get_friend_info()` 获取好友信息

获取指定好友的信息。

#### 参数

- `user_id`: 好友的用户 ID。
- `no_cache`: 是否不使用缓存。

#### 返回

- `Result<ApiReturn, ApiReturn>`

***

### `bot.get_group_list()` 获取群列表

获取当前登录号所在的群组列表。

#### 参数

- `no_cache`: 是否不使用缓存。

#### 返回

- `Result<ApiReturn, ApiReturn>`

***

### `bot.get_group_info()` 获取群信息

获取指定群组的信息。

#### 参数

- `group_id`: 群组的 ID。
- `no_cache`: 是否不使用缓存。传入 `true` 表示不使用缓存（可能获取到更及时的信息但响应较慢），传入 `false` 表示使用缓存（响应较快但信息可能不及时）。

#### 返回

- `Result<ApiReturn, ApiReturn>`

***

### `bot.get_group_member_list()` 获取群成员列表

获取指定群组中的所有成员列表。

#### 参数

- `group_id`: 群组的 ID。
- `no_cache`: 是否不使用缓存。

#### 返回

- `Result<ApiReturn, ApiReturn>`

***

### `bot.get_group_member_info()` 获取群成员信息

获取指定群组中某个成员的信息。

#### 参数

- `group_id`: 群组的 ID。
- `user_id`: 群组成员的用户 ID。
- `no_cache`: 是否不使用缓存。

#### 返回

- `Result<ApiReturn, ApiReturn>`

***

### `bot.get_peer_pins()` 获取置顶好友和群列表

获取当前登录号置顶的好友和群列表。

#### 返回

- `Result<ApiReturn, ApiReturn>`

***

### `bot.get_custom_face_url_list()` 获取自定义表情 URL 列表

获取当前登录号可用的自定义表情 URL 列表。

#### 返回

- `Result<ApiReturn, ApiReturn>`

***

### `bot.get_cookies()` 获取 Cookies

获取指定域名的 Cookies。

#### 参数

- `domain`: 需要获取 Cookies 的域名。

#### 返回

- `Result<ApiReturn, ApiReturn>`

***

### `bot.get_csrf_token()` 获取 CSRF Token

获取 CSRF Token。

#### 返回

- `Result<ApiReturn, ApiReturn>`

***

### `bot.send_private_message()` 发送私聊消息

发送私聊消息，并返回结果。

#### 参数

- `user_id`: 目标用户的 ID。
- `message`: 要发送的消息内容，类型为 `MilkyMessage`。

#### 返回

- `Result<ApiReturn, ApiReturn>`

***

### `bot.send_group_message()` 发送群聊消息

发送群聊消息，并返回结果。

#### 参数

- `group_id`: 目标群组的 ID。
- `message`: 要发送的消息内容，类型为 `MilkyMessage`。

#### 返回

- `Result<ApiReturn, ApiReturn>`

***

### `bot.get_message()` 获取消息

获取指定的消息内容。

#### 参数

- `message_scene`: 消息场景，如 `"friend"` 或 `"group"`。
- `peer_id`: 好友 ID 或群组 ID。
- `message_seq`: 消息序列号。

#### 返回

- `Result<ApiReturn, ApiReturn>`

***

### `bot.get_history_messages()` 获取历史消息列表

获取指定会话的历史消息列表。

#### 参数

- `message_scene`: 消息场景，如 `"friend"` 或 `"group"`。
- `peer_id`: 好友 ID 或群组 ID。
- `start_message_seq`: 起始消息序列号，可选。如果不传，则从最新消息开始。
- `limit`: 获取消息的数量上限。

#### 返回

- `Result<ApiReturn, ApiReturn>`

***

### `bot.get_resource_temp_url()` 获取临时资源链接

获取临时资源的下载链接。

#### 参数

- `resource_id`: 资源 ID。

#### 返回

- `Result<ApiReturn, ApiReturn>`

***

### `bot.get_forwarded_messages()` 获取合并转发消息

获取指定的合并转发消息内容。

#### 参数

- `forward_id`: 合并转发的 ID。

#### 返回

- `Result<ApiReturn, ApiReturn>`

***

### `bot.get_friend_requests()` 获取好友请求列表

获取当前登录号的好友请求列表。

#### 参数

- `limit`: 获取请求的数量上限。
- `is_filtered`: 是否只获取未过滤的请求。

#### 返回

- `Result<ApiReturn, ApiReturn>`

***

### `bot.get_group_announcements()` 获取群公告列表

获取指定群组的公告列表。

#### 参数

- `group_id`: 群组的 ID。

#### 返回

- `Result<ApiReturn, ApiReturn>`

***

### `bot.get_group_essence_messages()` 获取群精华消息列表

获取指定群组的精华消息列表。

#### 参数

- `group_id`: 群组的 ID。
- `page_index`: 页码，从 0 开始。
- `page_size`: 每页数量。

#### 返回

- `Result<ApiReturn, ApiReturn>`

***

### `bot.get_group_notifications()` 获取群通知列表

获取指定群组的通知列表（如加群请求、邀请等）。

#### 参数

- `start_notification_seq`: 起始通知序列号，可选。如果不传，则从最新通知开始。
- `is_filtered`: 是否只获取未过滤的通知。
- `limit`: 获取通知的数量上限。

#### 返回

- `Result<ApiReturn, ApiReturn>`

***

### `bot.upload_private_file()` 上传私聊文件

向指定用户上传文件，并返回结果。

#### 参数

- `user_id`: 目标用户的 ID。
- `file_uri`: 文件的 URI。
- `file_name`: 文件的名称。

#### 返回

- `Result<ApiReturn, ApiReturn>`

***

### `bot.upload_group_file()` 上传群文件

向指定群组上传文件，并返回结果。

#### 参数

- `group_id`: 目标群组的 ID。
- `parent_folder_id`: 目标父文件夹的 ID。
- `file_uri`: 文件的 URI。
- `file_name`: 文件的名称。

#### 返回

- `Result<ApiReturn, ApiReturn>`

***

### `bot.get_private_file_download_url()` 获取私聊文件下载链接

获取私聊中已发送文件的下载链接。

#### 参数

- `user_id`: 用户的 ID。
- `file_id`: 文件的 ID。
- `file_hash`: 文件的哈希值。

#### 返回

- `Result<ApiReturn, ApiReturn>`

***

### `bot.get_group_file_download_url()` 获取群文件下载链接

获取群文件中某个文件的下载链接。

#### 参数

- `group_id`: 群组的 ID。
- `file_id`: 文件的 ID。

#### 返回

- `Result<ApiReturn, ApiReturn>`

***

### `bot.get_group_files()` 获取群文件列表

获取指定群组文件夹中的文件列表。

#### 参数

- `group_id`: 群组的 ID。
- `parent_folder_id`: 文件夹的 ID。

#### 返回

- `Result<ApiReturn, ApiReturn>`

***

### `bot.create_group_folder()` 创建群文件夹

在指定群组中创建文件夹，并返回结果。

#### 参数

- `group_id`: 群组的 ID。
- `folder_name`: 新文件夹的名称。

#### 返回

- `Result<ApiReturn, ApiReturn>`

***


## 无返回值的 API

以下 API 为无返回值调用，直接发送请求后即返回，不等待响应结果。

### `bot.set_peer_pin()` 设置好友或群的置顶状态

设置指定好友或群聊
的置顶/取消置顶状态。

#### 参数

- `message_scene`: 消息场景，如 `"friend"` 或 `"group"`。
- `peer_id`: 好友 ID 或群组 ID。
- `is_pinned`: 是否置顶，传入 `true` 表示置顶，`false` 表示取消置顶。

***

### `bot.set_avatar()` 设置 QQ 账号头像

设置当前登录号的 QQ 头像。

#### 参数

- `uri`: 新头像的图片 URI。

***

### `bot.set_nickname()` 设置 QQ 账号昵称

设置当前登录号的 QQ 昵称。

#### 参数

- `new_nickname`: 新的昵称。

***

### `bot.set_bio()` 设置 QQ 账号个性签名

设置当前登录号的 QQ 个性签名。

#### 参数

- `new_bio`: 新的个性签名内容。

***

### `bot.recall_private_message()` 撤回私聊消息

撤回已发送的私聊消息。

#### 参数

- `user_id`: 目标用户的 ID。
- `message_seq`: 消息序列号。

***

### `bot.recall_group_message()` 撤回群聊消息

撤回已发送的群聊消息。

#### 参数

- `group_id`: 群组的 ID。
- `message_seq`: 消息序列号。

***

### `bot.mark_message_as_read()` 标记消息为已读

将指定消息标记为已读。

#### 参数

- `message_scene`: 消息场景，如 `"friend"` 或 `"group"`。
- `peer_id`: 好友 ID 或群组 ID。
- `message_seq`: 消息序列号。

***

### `bot.send_friend_nudge()` 发送好友戳一戳

对指定好友发送戳一戳。

#### 参数

- `user_id`: 目标用户的 ID。
- `is_self`: 是否发送给自己。

***

### `bot.send_profile_like()` 发送名片点赞

对指定用户发送名片点赞。

#### 参数

- `user_id`: 目标用户的 ID。
- `count`: 点赞的次数。

***

### `bot.delete_friend()` 删除好友

删除指定的好友。

#### 参数

- `user_id`: 要删除的好友的用户 ID。

***

### `bot.accept_friend_request()` 同意好友请求

同意收到的好友请求。

#### 参数

- `initiator_uid`: 请求发起者的 UID（需从上报的数据中获得）。
- `is_filtered`: 是否为已过滤的请求。

***

### `bot.reject_friend_request()` 拒绝好友请求

拒绝收到的好友请求。

#### 参数

- `initiator_uid`: 请求发起者的 UID。
- `is_filtered`: 是否为已过滤的请求。
- `reason`: 拒绝理由，可选。如果不传则不附理由。

***

### `bot.set_group_name()` 设置群名称

设置群组的新名称。

#### 参数

- `group_id`: 群组的 ID。
- `new_group_name`: 新的群组名称。

***

### `bot.set_group_avatar()` 设置群头像

设置指定群组的头像。

#### 参数

- `group_id`: 群组的 ID。
- `image_uri`: 新头像的图片 URI。

***

### `bot.set_group_member_card()` 设置群名片

设置或修改群组成员的群名片。

#### 参数

- `group_id`: 群组的 ID。
- `user_id`: 需要设置群名片的用户 ID。
- `card`: 群名片内容。

***

### `bot.set_group_member_special_title()` 设置群成员专属头衔

设置或删除群组成员的专属头衔。

#### 参数

- `group_id`: 群组的 ID。
- `user_id`: 需要设置或删除专属头衔的用户 ID。
- `special_title`: 专属头衔内容。传入空字符串表示删除专属头衔。

***

### `bot.set_group_member_admin()` 设置群管理员

设置或取消群组中的管理员权限。

#### 参数

- `group_id`: 群组的 ID。
- `user_id`: 需要设置或取消管理员权限的用户 ID。
- `is_set`: 是否设置管理员，传入 `true` 表示设置为管理员，`false` 表示取消管理员权限。

***

### `bot.set_group_member_mute()` 设置群成员禁言

对群组中的指定用户进行禁言或取消禁言。

#### 参数

- `group_id`: 群组的 ID。
- `user_id`: 需要禁言或取消禁言的用户 ID。
- `duration`: 禁言时长，单位为秒。`0` 表示取消禁言。

***

### `bot.set_group_whole_mute()` 设置群全员禁言

对群组中的所有成员进行禁言或取消禁言。

#### 参数

- `group_id`: 群组的 ID。
- `is_mute`: 是否禁言，传入 `true` 表示全员禁言，`false` 表示取消禁言。

***

### `bot.kick_group_member()` 踢出群成员

将指定用户从群组中踢出。

#### 参数

- `group_id`: 群组的 ID。
- `user_id`: 被踢出的用户 ID。
- `reject_add_request`: 是否拒绝此人的加群请求。如果传入 `true`，则拒绝此人再次加入该群组。

***

### `bot.send_group_announcement()` 发送群公告

向指定群组发送公告。

#### 参数

- `group_id`: 群组的 ID。
- `content`: 公告的内容。
- `image_uri`: 公告附带的图片 URI，可选。

***

### `bot.delete_group_announcement()` 删除群公告

删除指定群组的公告。

#### 参数

- `group_id`: 群组的 ID。
- `announcement_id`: 公告的 ID。

***

### `bot.set_group_essence_message()` 设置群精华消息

设置或取消群组的精华消息。

#### 参数

- `group_id`: 群组的 ID。
- `message_seq`: 消息序列号。
- `is_set`: 是否设为精华，传入 `true` 表示设为精华，`false` 表示取消精华。

***

### `bot.quit_group()` 退出群组

退出指定的群组。

#### 参数

- `group_id`: 群组的 ID。

***

### `bot.send_group_message_reaction()` 发送群消息表情回应

对群聊中的消息发送表情回应。

#### 参数

- `group_id`: 群组的 ID。
- `message_seq`: 消息序列号。
- `reaction`: 表情标识。
- `reaction_type`: 表情类型。
- `is_add`: 添加或取消回应，传入 `true` 表示添加，`false` 表示取消。

***

### `bot.send_group_nudge()` 发送群戳一戳

在群组中对指定用户发送戳一戳。

#### 参数

- `group_id`: 群组的 ID。
- `user_id`: 目标用户的 ID。

***

### `bot.accept_group_request()` 同意入群/邀请他人入群请求

同意用户入群请求或同意邀请他人入群的请求。

#### 参数

- `notification_seq`: 通知序列号（需从上报数据中获得）。
- `notification_type`: 通知类型（需与上报消息中的字段相符）。
- `group_id`: 群组的 ID。
- `is_filtered`: 是否为已过滤的通知。

***

### `bot.reject_group_request()` 拒绝入群/邀请他人入群请求

拒绝用户入群请求或拒绝邀请他人入群的请求。

#### 参数

- `notification_seq`: 通知序列号。
- `notification_type`: 通知类型。
- `group_id`: 群组的 ID。
- `is_filtered`: 是否为已过滤的通知。
- `reason`: 拒绝理由，可选。

***

### `bot.accept_group_invitation()` 同意他人邀请自身入群

同意他人邀请自己加入群组。

#### 参数

- `group_id`: 群组的 ID。
- `invitation_seq`: 邀请的序列号。

***

### `bot.reject_group_invitation()` 拒绝他人邀请自身入群

拒绝他人邀请自己加入群组。

#### 参数

- `group_id`: 群组的 ID。
- `invitation_seq`: 邀请的序列号。

***

### `bot.move_group_file()` 移动群文件

移动群文件到目标文件夹。

#### 参数

- `group_id`: 群组的 ID。
- `file_id`: 文件的 ID。
- `parent_folder_id`: 当前父文件夹的 ID。
- `target_folder_id`: 目标文件夹的 ID。

***

### `bot.rename_group_file()` 重命名群文件

重命名群组中的文件。

#### 参数

- `group_id`: 群组的 ID。
- `file_id`: 文件的 ID。
- `parent_folder_id`: 文件所在文件夹的 ID。
- `new_file_name`: 新的文件名。

***

### `bot.delete_group_file()` 删除群文件

删除群组中的文件。

#### 参数

- `group_id`: 群组的 ID。
- `file_id`: 文件的 ID。

***

### `bot.rename_group_folder()` 重命名群文件夹

重命名群组中的文件夹。

#### 参数

- `group_id`: 群组的 ID。
- `folder_id`: 文件夹的 ID。
- `new_folder_name`: 新的文件夹名称。

***

### `bot.delete_group_folder()` 删除群文件夹

删除群组中的文件夹。

#### 参数

- `group_id`: 群组的 ID。
- `folder_id`: 文件夹的 ID。
