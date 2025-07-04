# 社交日记 - 简单的社交问答应用

## 功能简介

社交日记是一个简单的 PWA 应用，让朋友之间可以互相发送问题并回答。设计灵感来自信封和信件的概念。

## 主要功能

1. **用户注册**: 使用4位邀请码和姓名创建账户
2. **发送问题**: 从预设的8个问题中选择一个发送给朋友
3. **接收回答**: 查看朋友发来的问题并进行回答
4. **信件管理**: 查看所有收发的信件和回答状态

## 使用流程

### 登录/注册
1. 访问 `/social-journal/login`
2. 输入你的4位邀请码
3. 输入你的姓名
4. 点击"登录/注册"

**自动识别逻辑：**
- 如果邀请码已存在且姓名匹配 → 直接登录
- 如果邀请码已存在但姓名不匹配 → 提示错误
- 如果邀请码不存在 → 创建新账户

### 发送问题给朋友
1. 在主页点击"发送新问题给朋友"
2. 从8个预设问题中选择一个
3. 输入朋友的4位邀请码
4. 点击"发送问题"

### 回答朋友的问题
1. 在主页的信件列表中，红色信封表示待回答的问题
2. 点击进入信件详情
3. 在回答框中输入你的回答
4. 点击"提交回答"

### 查看回答
1. 蓝色信封表示已收到回答的问题
2. 绿色信封表示你已回答的问题
3. 灰色信封表示等待朋友回答的问题

## 预设问题列表

1. 今天最让你开心的事情是什么？
2. 你最近在思考什么问题？
3. 如果可以和任何人吃饭，你会选择谁？
4. 你童年最美好的回忆是什么？
5. 你最想去的地方是哪里？
6. 你最近学到了什么新东西？
7. 你觉得什么品质在朋友身上最重要？
8. 你最喜欢的季节是什么，为什么？

## 技术特点

- **PWA支持**: 可以安装到手机桌面，支持离线访问
- **响应式设计**: 适配手机和桌面设备
- **实时数据**: 使用 Supabase 实时同步数据
- **简单认证**: 基于4位邀请码的轻量级认证

## 测试账户

为了测试，已创建以下测试账户：
- 邀请码: `1234`, 姓名: 张三
- 邀请码: `5678`, 姓名: 李四

## 注意事项

1. 邀请码是唯一的，不能重复使用
2. 一旦创建账户，邀请码不能修改
3. 请记住你的邀请码，它是你的唯一标识
4. 朋友需要知道你的邀请码才能发送问题给你

## 数据隐私

- 只有发送者和接收者可以查看具体的信件内容
- 邀请码和姓名是公开的（用于发送信件）
- 所有数据存储在 Supabase 数据库中