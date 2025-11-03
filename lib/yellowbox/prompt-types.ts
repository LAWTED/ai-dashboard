/**
 * System Prompt 类型定义
 * 用于自定义 AI 对话和模板生成的 prompt
 */

// Prompt 应用场景
export type PromptContext = 'diary' | 'template';

// 时段类型
export type TimeOfDay = 'morning' | 'daytime' | 'evening';

/**
 * 自定义 System Prompt
 */
export interface CustomSystemPrompt {
  id: string;
  name: string;
  description?: string;

  // 针对日记对话的 prompt（分时段）
  diaryPrompt?: {
    morning?: string;     // 早间 prompt
    daytime?: string;     // 日间 prompt
    evening?: string;     // 夜间 prompt
  };

  // 针对模板生成的 prompt（分语言）
  templatePrompt?: {
    zh?: string;          // 中文 prompt
    en?: string;          // 英文 prompt
  };

  isActive: boolean;      // 是否为当前激活的 prompt
  isBuiltIn: boolean;     // 是否为内置预设
  createdAt: string;
  updatedAt: string;
}

/**
 * 用户 Prompt 设置
 */
export interface SystemPromptSettings {
  // 默认使用的 prompt ID
  defaultDiaryPromptId: string;
  defaultTemplatePromptId: string;

  // 所有自定义 prompts
  customPrompts: CustomSystemPrompt[];
}

/**
 * 重新生成消息请求
 */
export interface RegenerateMessageRequest {
  entryId: string;
  messageIndex: number;          // 要重新生成的消息索引
  promptId?: string;             // 可选：使用特定 prompt
  timeOfDay: TimeOfDay;          // 当前时段
  conversationHistory: Array<{   // 上下文（到 messageIndex 为止）
    type: 'user' | 'ai';
    content: string;
    images?: string[];
  }>;
  selectedQuestion?: string;     // 原始问题
  conversationCount?: number;    // 对话轮数
}

/**
 * 重新生成消息响应
 */
export interface RegenerateMessageResponse {
  regeneratedMessage: string;
  promptUsed: string;            // 使用的 prompt ID
  success: boolean;
  error?: string;
}
