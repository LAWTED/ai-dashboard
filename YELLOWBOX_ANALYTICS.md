# YellowBox Analytics 功能说明

## 概述

YellowBox 现在包含了全面的用户行为分析功能，用于收集和分析用户在写日记时的各种行为数据，以便改进产品体验和了解用户使用模式。

## 收集的数据类型

### 1. 打字行为分析
- **按键模式**: 记录按键时间戳、按键类型、文本长度
- **编辑行为**: 退格次数、删除字符数、修改次数、粘贴操作
- **写作节奏**: 打字速度、停顿时间、思考间隔

### 2. 会话时间追踪
- **会话时长**: 开始时间、结束时间、总时长
- **活跃写作时间**: 实际打字时间
- **停顿分析**: 停顿时长分布、最长停顿时间
- **首次互动时间**: 页面加载到首次输入的时间

### 3. 用户交互记录
- **语音功能使用**: 语音按钮点击次数、语音输入使用频率
- **界面操作**: 字体切换记录、语言切换记录
- **功能使用**: 重置按钮点击、提交尝试次数

### 4. 内容质量分析
- **基础统计**: 字符数、单词数、句子数
- **写作质量**: 平均句子长度、写作速度（字/分钟）
- **语言检测**: 检测使用的语言类型

### 5. 性能监控
- **API 响应时间**: 各个接口的响应时间记录
- **错误统计**: 转录错误、AI 响应错误、保存错误、网络错误
- **加载性能**: 页面加载时间、首次交互时间

### 6. 设备与环境信息
- **设备信息**: User-Agent、屏幕分辨率、移动设备检测
- **浏览器信息**: 浏览器语言偏好

## 数据存储结构

所有分析数据存储在 `yellowbox_entries` 表的 `analytics` JSON 字段中，包含以下结构：

```typescript
interface YellowBoxAnalytics {
  sessionId: string;
  userId: string;
  typingPatterns: TypingPattern[];
  editingBehavior: EditingBehavior;
  sessionTiming: SessionTiming;
  userInteractions: UserInteractions;
  contentAnalysis: ContentAnalysis;
  performance: PerformanceMetrics;
  deviceInfo?: DeviceInfo;
  analyticsConsent: boolean;
  anonymized: boolean;
}
```

## 隐私保护

- **用户同意**: 默认启用数据收集，用户可以选择退出
- **数据匿名化**: 支持匿名化处理
- **最小化收集**: 只收集产品改进必需的数据
- **本地处理**: 大部分分析在客户端进行

## 实际应用

### 产品改进洞察
1. **用户体验优化**: 通过响应时间和错误率识别性能瓶颈
2. **功能使用分析**: 了解哪些功能最受欢迎，哪些需要改进
3. **写作习惯研究**: 分析用户写作模式，优化提示和界面

### 个性化体验
1. **智能提示**: 基于写作速度和停顿模式提供个性化提示
2. **界面适配**: 根据设备类型和使用习惯优化界面
3. **内容推荐**: 基于历史写作主题推荐相关问题

## 技术实现

### 前端组件
- `useYellowboxAnalytics` Hook: 核心分析逻辑
- 实时事件捕获: 键盘事件、交互事件、性能事件
- 自动数据收集: 无需用户额外操作

### 后端集成
- API 端点更新: 支持 analytics 数据保存
- 数据库扩展: 新增 analytics JSON 字段
- 性能优化: 批量数据处理和存储

### 数据处理
- 客户端预处理: 减少服务器负载
- 增量更新: 实时跟踪用户行为变化
- 数据压缩: 只保留最近和最重要的数据点

## 未来扩展

### 高级分析功能
1. **情感分析**: 集成 AI 分析日记情感倾向
2. **主题聚类**: 自动识别和分类日记主题
3. **写作质量评估**: 提供写作建议和改进提示

### 数据可视化
1. **个人仪表板**: 用户可查看自己的写作统计
2. **趋势分析**: 长期写作习惯和进步跟踪
3. **对比分析**: 与其他用户的匿名对比

### 智能推荐
1. **最佳写作时间**: 基于历史数据推荐最佳写作时段
2. **个性化问题**: 根据兴趣和回应模式推荐问题
3. **写作目标**: 设定和跟踪个人写作目标

## 开发者说明

要查看和使用分析数据，可以：

1. **数据库查询**: 直接从 `yellowbox_entries.analytics` 字段获取数据
2. **API 扩展**: 创建新的分析 API 端点处理数据
3. **前端组件**: 使用 `useYellowboxAnalytics` Hook 访问实时数据

示例查询：
```sql
SELECT 
  analytics->'sessionTiming'->>'totalDuration' as session_duration,
  analytics->'contentAnalysis'->>'wordCount' as word_count,
  analytics->'userInteractions'->>'voiceInputUsage' as voice_usage
FROM yellowbox_entries 
WHERE user_id = '...' 
ORDER BY created_at DESC;
```