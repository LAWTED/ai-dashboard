/**
 * 统一的模板系统类型定义 - MVP 版本
 * 使用标准 Tldraw 格式，不再兼容旧版本
 */

// ====================== Tldraw 标准格式 ======================

/**
 * 标准 Tldraw Snapshot 结构
 * 直接对应 Tldraw 的导出格式
 */
export interface TldrawSnapshot {
  /** Tldraw store - 包含所有 shapes 和记录 */
  store: Record<string, TldrawRecord>;
  /** Schema 版本信息 */
  schema: {
    schemaVersion: number;
    storeVersion: number;
    recordVersions: Record<string, { version: number }>;
  };
}

/**
 * Tldraw 记录的基础结构
 */
export interface TldrawRecord {
  id: string;
  typeName: string;
  [key: string]: unknown;
}

/**
 * Text Shape 结构 - 用于文本识别和替换
 */
export interface TldrawTextShape extends TldrawRecord {
  typeName: 'shape';
  type: 'text';
  x: number;
  y: number;
  props: {
    color: string;
    size: 'xs' | 's' | 'm' | 'l' | 'xl';
    font: 'draw' | 'sans' | 'serif' | 'mono';
    w: number;
    h: number;
    autoSize: boolean;
    text: string; // 纯文本
  };
}

/**
 * 其他常见 Shape 类型
 */
export interface TldrawImageShape extends TldrawRecord {
  typeName: 'shape';
  type: 'image';
  x: number;
  y: number;
  props: {
    w: number;
    h: number;
    assetId: string;
    url?: string;
  };
}

// ====================== 模板系统核心类型 ======================

/**
 * 简化的模板定义 - MVP 版本
 */
export interface Template {
  /** 唯一标识 */
  id: string;
  /** 模板名称 */
  name: string;
  /** 描述 */
  description: string;
  /** 标准 Tldraw snapshot */
  snapshot: TldrawSnapshot;
  /** 创建者 ID（null 表示系统内置） */
  userId?: string | null;
  /** 是否公开 */
  isPublic: boolean;
  /** 创建时间 */
  createdAt: string;
}

/**
 * 可替换文本配置 - 自动分析生成
 */
export interface ReplaceableText {
  /** Shape ID */
  shapeId: string;
  /** 文本类型 */
  type: 'title' | 'body' | 'caption';
  /** 原始文本 */
  originalText: string;
  /** 推荐最大长度 */
  maxLength: number;
  /** 位置权重（用于排序） */
  priority: number;
  /** 样式信息 */
  style: {
    color: string;
    size: string;
    font: string;
    width: number;
  };
}

/**
 * 日记内容接口
 */
export interface DiaryContent {
  conversationHistory: Array<{
    type: 'user' | 'ai';
    content: string;
    images?: string[];
  }>;
  selectedQuestion?: string;
  summary?: string;
  enhancedSummary?: {
    title: string;
    tags: string[];
    emotion: {
      primary: string;
      intensity: 'low' | 'medium' | 'high';
    };
    themes: string[];
  };
}

/**
 * 模板应用结果
 */
export interface TemplateApplicationResult {
  success: boolean;
  modifiedSnapshot?: TldrawSnapshot;
  error?: string;
  metadata?: {
    replacedTextCount: number;
    processingTimeMs: number;
    generatedWords: number;
  };
}

// ====================== API 接口类型 ======================

/**
 * 创建模板请求
 */
export interface CreateTemplateRequest {
  name: string;
  description: string;
  snapshot: TldrawSnapshot;
  isPublic?: boolean;
}

/**
 * 模板列表项（用于展示）
 */
export interface TemplateListItem {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  isBuiltin: boolean;
  stats: {
    textShapes: number;
    imageShapes: number;
    totalShapes: number;
  };
}

/**
 * 应用模板请求
 */
export interface ApplyTemplateRequest {
  templateId: string;
  diaryContent: DiaryContent;
  language: 'zh' | 'en';
}

// ====================== 工具函数类型 ======================

/**
 * 统一结果类型
 */
export interface Result<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * 文本生成配置
 */
export interface TextGenerationOptions {
  prompt: string;
  maxTokens: number;
  language: 'zh' | 'en';
}

/**
 * 模板统计信息
 */
export interface TemplateStats {
  totalShapes: number;
  textShapes: number;
  imageShapes: number;
  replaceableTexts: number;
}

// ====================== 数据库类型 ======================

/**
 * 数据库中的模板记录
 */
export interface TemplateRecord {
  id: string;
  name: string;
  description: string | null;
  snapshot: TldrawSnapshot; // 直接使用标准格式
  user_id: string | null;
  is_public: boolean;
  created_at: string;
}