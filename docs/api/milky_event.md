# Event

Milky 协议的事件体系。所有事件均以 `MilkyEvent<T>` 为包装，其中 `data` 字段承载具体的业务数据。

[[toc]]

## 通用结构

```rust
#[derive(Serialize, Deserialize, Debug)]
pub struct MilkyEvent<T = serde_json::Value> {
    /// 事件类型，如 "message_receive"、"bot_offline" 等
    pub event_type: String,
    /// 事件 Unix 时间戳（秒）
    pub time: i64,
    /// 机器人 QQ 号
    pub self_id: i64,
    /// 具体的事件数据
    pub data: T,
}
```


## 消息事件

### MsgEvent

通用消息接收事件。`message_scene` 字段区分消息来源场景。

```rust
pub struct MessageReceiveEventData {
    /// 消息 Unix 时间戳（秒）
    pub time: i64,
    /// 消息场景：Friend / Group / Temp
    pub message_scene: MessageScene,
    /// 消息序列号
    pub message_seq: i64,
    /// 好友 QQ 号或群号
    pub peer_id: Option<i64>,
    /// 发送者 QQ 号
    pub sender_id: i64,
    /// 消息内容（消息段列表）
    pub segments: MilkyMessage,
    /// 好友信息（好友/临时会话场景下存在）
    pub friend: Option<FriendEntity>,
    /// 群信息（群/临时会话场景下存在）
    pub group: Option<GroupEntity>,
    /// 群成员信息（群场景下存在）
    pub group_member: Option<GroupMemberEntity>,

    pub message: KoviMessage,
    /// 处理过的纯文本，如果是纯图片或无文本，此处为 None
    pub text: Option<String>,
    /// 处理过的文本，会解析成人类易读形式
    pub human_text: String,
}
```

**方法：**

- `event.reply(msg)` — 快速回复消息，可传入字符串或 `KoviMessage`
- `event.reply_and_quote(msg)` — 快速回复并引用原消息
- `event.is_group() -> bool` — 是否为群聊消息
- `event.is_private() -> bool` — 是否为私聊消息
- `event.get_text() -> String` — 获取纯文本内容
- `event.get_sender_nickname() -> String` — 获取发送者昵称
- `event.borrow_text() -> Option<&str>` — 借用文本内容

### GroupMsgEvent

群消息事件，`data.group` 和 `data.group_member` 保证存在。

```rust
pub struct GroupMessageReceiveEventData {
    pub time: i64,
    pub message_scene: MessageScene,
    pub message_seq: i64,
    pub peer_id: Option<i64>,
    pub sender_id: i64,
    pub segments: MilkyMessage,

    pub group: GroupEntity,
    pub group_member: GroupMemberEntity,

    pub message: KoviMessage,
    pub text: Option<String>,
    pub human_text: String,
}
```

方法与 `MsgEvent` 相同。

### FriendMsgEvent / PrivateMsgEvent

好友消息事件，`data.friend` 保证存在。

```rust
pub struct FriendMessageReceiveEventData {
    pub time: i64,
    pub message_scene: MessageScene,
    pub message_seq: i64,
    pub peer_id: Option<i64>,
    pub sender_id: i64,
    pub segments: MilkyMessage,

    pub friend: FriendEntity,

    pub message: KoviMessage,
    pub text: Option<String>,
    pub human_text: String,
}
```

`PrivateMsgEvent` 是 `FriendMsgEvent` 的别名。

### AdminMsgEvent

管理员消息事件。仅当发送者在 bot 的管理员列表中时才触发。

```rust
pub struct AdminMessageReceiveEventData {
    pub time: i64,
    pub message_scene: MessageScene,
    pub message_seq: i64,
    pub peer_id: Option<i64>,
    pub sender_id: i64,
    pub segments: MilkyMessage,

    pub friend: Option<FriendEntity>,
    pub group: Option<GroupEntity>,
    pub group_member: Option<GroupMemberEntity>,

    pub message: KoviMessage,
    pub text: Option<String>,
    pub human_text: String,
}
```


## 消息发送事件

### MsgSendFromKoviEvent

监听来自 Kovi 的 API 消息发送请求及其响应结果。

```rust
pub struct MsgSendFromKoviEvent {
    /// 事件类型
    pub event_type: MsgSendFromKoviType,
    /// 发送消息的 API 内容
    pub send_api: SendApi,
    /// 发送消息的 API 响应结果
    pub res: Result<ApiReturn, ApiReturn>,
}

pub enum MsgSendFromKoviType {
    SendPrivateMsg,
    SendGroupMsg,
}
```


## 机器人事件

### BotOfflineEvent

机器人离线事件。

```rust
pub struct BotOfflineReceiveEventData {
    /// 下线原因
    pub reason: String,
}
```


## 消息与会话事件

### MessageRecallEvent

消息撤回事件。

```rust
pub struct MessageRecallReceiveEventData {
    /// 消息场景：Friend / Group / Temp
    pub message_scene: MessageScene,
    /// 好友 QQ 号或群号
    pub peer_id: i64,
    /// 消息序列号
    pub message_seq: i64,
    /// 被撤回的消息的发送者 QQ 号
    pub sender_id: i64,
    /// 操作者 QQ 号
    pub operator_id: i64,
    /// 撤回提示的后缀文本
    pub display_suffix: String,
}
```

### PeerPinChangeEvent

会话置顶变更事件（since v1.2）。

```rust
pub struct PeerPinChangeReceiveEventData {
    /// 发生改变的会话的消息场景：Friend / Group / Temp
    pub message_scene: MessageScene,
    /// 发生改变的好友 QQ 号或群号
    pub peer_id: i64,
    /// 是否被置顶，false 表示取消置顶
    pub is_pinned: bool,
}
```


## 好友事件

### FriendRequestEvent

好友请求事件。

```rust
pub struct FriendRequestReceiveEventData {
    /// 申请好友的用户 QQ 号
    pub initiator_id: i64,
    /// 用户 UID
    pub initiator_uid: String,
    /// 申请附加信息
    pub comment: String,
    /// 申请来源
    pub via: String,
}
```

### FriendNudgeEvent

好友戳一戳事件。

```rust
pub struct FriendNudgeReceiveEventData {
    /// 好友 QQ 号
    pub user_id: i64,
    /// 是否是自己发送的戳一戳
    pub is_self_send: bool,
    /// 是否是自己接收的戳一戳
    pub is_self_receive: bool,
    /// 戳一戳提示的动作文本
    pub display_action: String,
    /// 戳一戳提示的后缀文本
    pub display_suffix: String,
    /// 戳一戳提示的动作图片 URL
    pub display_action_img_url: String,
}
```

### FriendFileUploadEvent

好友文件上传事件。

```rust
pub struct FriendFileUploadReceiveEventData {
    /// 好友 QQ 号
    pub user_id: i64,
    /// 文件 ID
    pub file_id: String,
    /// 文件名称
    pub file_name: String,
    /// 文件大小（字节）
    pub file_size: i64,
    /// 文件的 TriSHA1 哈希值
    pub file_hash: String,
    /// 是否是自己发送的文件
    pub is_self: bool,
}
```


## 群请求事件

### GroupJoinRequestEvent

用户入群请求事件。

```rust
pub struct GroupJoinRequestReceiveEventData {
    /// 群号
    pub group_id: i64,
    /// 请求对应的通知序列号
    pub notification_seq: i64,
    /// 请求是否被过滤（发起自风险账户）
    pub is_filtered: bool,
    /// 申请入群的用户 QQ 号
    pub initiator_id: i64,
    /// 申请附加信息
    pub comment: String,
}
```

### GroupInvitedJoinRequestEvent

群成员邀请他人入群请求事件。

```rust
pub struct GroupInvitedJoinRequestReceiveEventData {
    /// 群号
    pub group_id: i64,
    /// 请求对应的通知序列号
    pub notification_seq: i64,
    /// 邀请者 QQ 号
    pub initiator_id: i64,
    /// 被邀请者 QQ 号
    pub target_user_id: i64,
}
```

### GroupInvitationEvent

他人邀请自身入群事件。

```rust
pub struct GroupInvitationReceiveEventData {
    /// 群号
    pub group_id: i64,
    /// 邀请序列号
    pub invitation_seq: i64,
    /// 邀请者 QQ 号
    pub initiator_id: i64,
    /// 来源群号，如果是通过 QQ 群邀请
    pub source_group_id: Option<i64>,
}
```


## 群通知事件

### GroupAdminChangeEvent

群管理员变更事件。

```rust
pub struct GroupAdminChangeReceiveEventData {
    /// 群号
    pub group_id: i64,
    /// 发生变更的用户 QQ 号
    pub user_id: i64,
    /// 操作者 QQ 号
    pub operator_id: i64,
    /// 是否被设置为管理员，false 表示被取消管理员
    pub is_set: bool,
}
```

### GroupEssenceMessageChangeEvent

群精华消息变更事件。

```rust
pub struct GroupEssenceMessageChangeReceiveEventData {
    /// 群号
    pub group_id: i64,
    /// 发生变更的消息序列号
    pub message_seq: i64,
    /// 操作者 QQ 号
    pub operator_id: i64,
    /// 是否被设置为精华，false 表示被取消精华
    pub is_set: bool,
}
```

### GroupMemberIncreaseEvent

群成员增加事件。

```rust
pub struct GroupMemberIncreaseReceiveEventData {
    /// 群号
    pub group_id: i64,
    /// 发生变更的用户 QQ 号
    pub user_id: i64,
    /// 管理员 QQ 号，如果是管理员同意入群
    pub operator_id: Option<i64>,
    /// 邀请者 QQ 号，如果是邀请入群
    pub invitor_id: Option<i64>,
}
```

### GroupMemberDecreaseEvent

群成员减少事件。

```rust
pub struct GroupMemberDecreaseReceiveEventData {
    /// 群号
    pub group_id: i64,
    /// 发生变更的用户 QQ 号
    pub user_id: i64,
    /// 管理员 QQ 号，如果是管理员踢出
    pub operator_id: Option<i64>,
}
```

### GroupNameChangeEvent

群名称变更事件。

```rust
pub struct GroupNameChangeReceiveEventData {
    /// 群号
    pub group_id: i64,
    /// 新的群名称
    pub new_group_name: String,
    /// 操作者 QQ 号
    pub operator_id: i64,
}
```

### GroupMessageReactionEvent

群消息表情回应事件。

```rust
pub struct GroupMessageReactionReceiveEventData {
    /// 群号
    pub group_id: i64,
    /// 发送回应者 QQ 号
    pub user_id: i64,
    /// 消息序列号
    pub message_seq: i64,
    /// 表情 ID
    pub face_id: String,
    /// 收到的回应类型
    pub reaction_type: ReactionType,
    /// 是否为添加，false 表示取消回应
    pub is_add: bool,
}

pub enum ReactionType {
    Face,   // 系统表情
    Emoji,  // 自定义 emoji
}
```

### GroupMuteEvent

群禁言事件。

```rust
pub struct GroupMuteReceiveEventData {
    /// 群号
    pub group_id: i64,
    /// 发生变更的用户 QQ 号
    pub user_id: i64,
    /// 操作者 QQ 号
    pub operator_id: i64,
    /// 禁言时长（秒），为 0 表示取消禁言
    pub duration: i32,
}
```

### GroupWholeMuteEvent

群全体禁言事件。

```rust
pub struct GroupWholeMuteReceiveEventData {
    /// 群号
    pub group_id: i64,
    /// 操作者 QQ 号
    pub operator_id: i64,
    /// 是否全员禁言，false 表示取消全员禁言
    pub is_mute: bool,
}
```

### GroupNudgeEvent

群戳一戳事件。

```rust
pub struct GroupNudgeReceiveEventData {
    /// 群号
    pub group_id: i64,
    /// 发送者 QQ 号
    pub sender_id: i64,
    /// 接收者 QQ 号
    pub receiver_id: i64,
    /// 戳一戳提示的动作文本
    pub display_action: String,
    /// 戳一戳提示的后缀文本
    pub display_suffix: String,
    /// 戳一戳提示的动作图片 URL
    pub display_action_img_url: String,
}
```

### GroupFileUploadEvent

群文件上传事件。

```rust
pub struct GroupFileUploadReceiveEventData {
    /// 群号
    pub group_id: i64,
    /// 发送者 QQ 号
    pub user_id: i64,
    /// 文件 ID
    pub file_id: String,
    /// 文件名称
    pub file_name: String,
    /// 文件大小（字节）
    pub file_size: i64,
}
```


## 公共实体

### MessageScene

```rust
pub enum MessageScene {
    Friend,  // 好友消息
    Group,   // 群消息
    Temp,    // 临时会话消息
}
```

### GroupEntity

```rust
pub struct GroupEntity {
    pub group_id: i64,         // 群号
    pub group_name: String,     // 群名称
    pub member_count: i32,      // 群成员数量
    pub max_member_count: i32,  // 群容量
    pub remark: String,         // 群备注
    pub created_time: i64,      // 群创建时间
    pub description: String,    // 群简介
    pub question: String,       // 加群验证问题
    pub announcement: String,   // 群公告预览
}
```

### GroupMemberEntity

```rust
pub struct GroupMemberEntity {
    pub user_id: i64,           // 用户 QQ 号
    pub nickname: String,       // 用户昵称
    pub sex: String,            // 用户性别：male / female / unknown
    pub group_id: i64,          // 群号
    pub card: String,           // 成员备注
    pub title: String,          // 专属头衔
    pub level: i32,             // 群等级
    pub role: String,           // 权限等级：owner / admin / member
    pub join_time: i64,         // 入群时间
    pub last_sent_time: i64,    // 最后发言时间
    pub shut_up_end_time: Option<i64>, // 禁言结束时间
}
```

### FriendEntity

```rust
pub struct FriendEntity {
    pub user_id: i64,                  // 用户 QQ 号
    pub nickname: String,              // 用户昵称
    pub sex: Sex,                      // 用户性别
    pub qid: String,                   // 用户 QID
    pub remark: String,                // 好友备注
    pub category: FriendCategoryEntity,// 好友分组
}

pub enum Sex {
    Male,
    Female,
    Unknown,
}

pub struct FriendCategoryEntity {
    pub category_id: i32,      // 好友分组 ID
    pub category_name: String,  // 好友分组名称
}
```
