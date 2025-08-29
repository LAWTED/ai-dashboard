/**
 * 统一的模板系统类型定义
 * MVP 版本 - 简化但完整的类型系统
 */

// ====================== Tldraw 相关类型 ======================

/**
 * Tldraw Snapshot 结构
 * 基于 tldraw 官方格式，简化为实用版本
 */
export interface TldrawSnapshot {
  /** 文档数据 - 包含所有 shapes */
  document: TldrawDocument;
  /** 元数据（可选） */
  meta?: SnapshotMeta;
}

/**
 * Tldraw Document 结构
 * 注意：实际 Tldraw snapshot 结构比这复杂，这里使用 any 来兼容
 */
export interface TldrawDocument {
  /** 完整的 Tldraw snapshot 数据，包含 schema 等信息 */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

/**
 * Tldraw 记录的基本结构
 */
export interface TldrawRecord {
  id: string;
  typeName: string;
  [key: string]: unknown;
}

/**
 * Text Shape 的结构（用于文本替换）
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
    autoSize: boolean;
    richText: TldrawRichText;
  };
}

/**
 * Tldraw RichText 结构
 */
export interface TldrawRichText {
  type: 'doc';
  content: Array<{
    type: 'paragraph';
    attrs?: { dir?: 'auto' | 'ltr' | 'rtl' };
    content?: Array<{
      type: 'text';
      text: string;
      marks?: Array<{ type: string; attrs?: unknown }>;
    }>;
  }>;
}

/**
 * Snapshot 元数据
 */
export interface SnapshotMeta {
  id: string;
  createdAt: number;
  version: string;
}

// ====================== 模板系统类型 ======================

/**
 * 模板定义
 */
export interface Template {
  /** 模板唯一标识 */
  id: string;
  /** 模板名称 */
  name: string;
  /** 模板描述 */
  description: string;
  /** Tldraw 快照数据 */
  snapshot: TldrawSnapshot;
  /** 可替换的文本 Shape ID 列表 */
  replaceableShapes: string[];
  /** 预览图 URL（可选） */
  previewUrl?: string;
  /** 创建者 ID */
  userId?: string;
  /** 是否公开 */
  isPublic: boolean;
  /** 创建时间 */
  createdAt: string;
}

/**
 * 可替换文本的配置 - 简化版本
 */
export interface ReplaceableText {
  /** Shape ID */
  shapeId: string;
  /** 文本类型 - MVP只区分标题和正文 */
  type: 'title' | 'body';
  /** 当前文本内容 */
  originalText: string;
  /** 最大长度限制 */
  maxLength: number;
  /** 文本样式 */
  style: {
    color: string;
    size: string;
    font: string;
    width: number;
  };
  /** 位置信息 */
  position: {
    x: number;
    y: number;
  };
}

/**
 * 模板应用请求
 */
export interface TemplateApplicationRequest {
  /** 模板 ID */
  templateId: string;
  /** 日记内容 */
  diaryContent: DiaryContent;
  /** 语言 */
  language: 'zh' | 'en';
  /** 是否保留图片 */
  preserveImages?: boolean;
}

/**
 * 模板应用结果
 */
export interface TemplateApplicationResult {
  /** 是否成功 */
  success: boolean;
  /** 修改后的快照 */
  modifiedSnapshot?: TldrawSnapshot;
  /** 错误信息 */
  error?: string;
  /** 处理元数据 */
  metadata?: {
    originalTextCount: number;
    generatedTextCount: number;
    processingTime: number;
  };
}

/**
 * 日记内容（来自现有系统）
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

// ====================== 通用结果类型 ======================

/**
 * 统一的结果类型，用于错误处理
 */
export interface Result<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ====================== 辅助类型 ======================

/**
 * 模板创建请求
 */
export interface CreateTemplateRequest {
  name: string;
  description: string;
  snapshot: TldrawSnapshot;
  replaceableShapes?: string[];
  isPublic?: boolean;
}

/**
 * 模板更新请求
 */
export interface UpdateTemplateRequest {
  name?: string;
  description?: string;
  snapshot?: TldrawSnapshot;
  replaceableShapes?: string[];
  isPublic?: boolean;
}

/**
 * 模板列表查询选项
 */
export interface TemplateListOptions {
  /** 只返回公开模板 */
  publicOnly?: boolean;
  /** 只返回用户自己的模板 */
  ownOnly?: boolean;
  /** 分页大小 */
  limit?: number;
  /** 分页偏移 */
  offset?: number;
}

/**
 * 模板元数据（用于列表显示）
 */
export interface TemplateMetadata {
  id: string;
  name: string;
  description: string;
  textShapeCount: number;
  imageCount: number;
  tags: string[];
  language: 'zh' | 'en';
}

/**
 * 数据库中的模板记录
 */
export interface TemplateRecord {
  id: string;
  name: string;
  description: string | null;
  snapshot: TldrawSnapshot; // JSON 数据
  replaceable_shapes: string[] | null;
  preview_url: string | null;
  user_id: string | null;
  is_public: boolean;
  created_at: string;
}

// ====================== 工具函数类型 ======================

/**
 * 文本生成配置
 */
export interface TextGenerationConfig {
  /** 提示词 */
  prompt: string;
  /** 语言 */
  language: 'zh' | 'en';
  /** 最大长度 */
  maxLength: number;
  /** 文本类型（影响生成策略） */
  textType: 'title' | 'body' | 'decoration';
}

/**
 * 批量文本生成请求
 */
export interface BatchTextGenerationRequest {
  /** 日记内容 */
  diaryContent: DiaryContent;
  /** 文本配置列表 */
  textConfigs: TextGenerationConfig[];
  /** 语言 */
  language: 'zh' | 'en';
}

/**
 * 批量文本生成结果
 */
export interface BatchTextGenerationResult {
  /** 生成的文本列表 */
  texts: string[];
  /** 是否全部成功 */
  success: boolean;
  /** 错误信息 */
  error?: string;
}