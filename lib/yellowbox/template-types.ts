/**
 * 简化的模板系统类型定义 - MVP版本
 * 专注于核心功能：文本替换和长度匹配
 */

// ====================== Tldraw 基础类型 ======================

/**
 * Tldraw Snapshot 结构
 */
export interface TldrawSnapshot {
  store: Record<string, TldrawRecord>;
  schema: {
    schemaVersion: number;
    storeVersion: number;
    recordVersions: Record<string, { version: number }>;
  };
}

/**
 * Tldraw 记录基础结构
 */
export interface TldrawRecord {
  id: string;
  typeName: string;
  [key: string]: unknown;
}

/**
 * Tldraw 文本 Shape
 */
export interface TldrawRichText {
  type: string;
  content: unknown[];
}

export interface TldrawTextShape extends TldrawRecord {
  typeName: 'shape';
  type: 'text';
  x: number;
  y: number;
  props: {
    color: string;
    size: string;
    font: string;
    textAlign?: string;
    w: number;
    autoSize: boolean;
    scale?: number;
    richText?: TldrawRichText;
    h?: number;
    [key: string]: unknown;
  };
}

// ====================== 模板系统核心类型 ======================

/**
 * 简化的模板定义
 */
export interface Template {
  id: string;
  name: string;
  description: string;
  snapshot: TldrawSnapshot;
  previewUrl?: string;
}

/**
 * 可替换的文本信息
 */
export interface ReplaceableText {
  shapeId: string;
  originalText: string;
  targetLength: number;
}

/**
 * 日记内容
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
 * 模板应用请求
 */
export interface ApplyTemplateRequest {
  templateId: string;
  diaryContent: DiaryContent;
  language?: 'zh' | 'en';
}

/**
 * 模板应用结果
 */
export interface TemplateApplicationResult {
  success: boolean;
  modifiedSnapshot?: TldrawSnapshot;
  error?: string;
  replacedCount?: number;
}

/**
 * AI 文本生成请求
 */
export interface TextGenerationRequest {
  originalText: string;
  targetLength: number;
  diaryContent: DiaryContent;
  language?: 'zh' | 'en';
}

/**
 * AI 文本生成结果
 */
export interface TextGenerationResult {
  text: string;
  actualLength: number;
  success: boolean;
}
