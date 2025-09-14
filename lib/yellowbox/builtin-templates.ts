/**
 * 内置模板定义
 * 提供一些高质量的默认模板供用户使用
 */

import { CreateTemplateRequest, TldrawSnapshot } from './types/template';

/**
 * 创建一个基础的 Tldraw snapshot 结构
 */
function createBaseSnapshot(): TldrawSnapshot {
  return {
    store: {},
    schema: {
      schemaVersion: 2,
      storeVersion: 4,
      recordVersions: {
        asset: { version: 1 },
        camera: { version: 1 },
        document: { version: 2 },
        instance: { version: 25 },
        instance_page_state: { version: 5 },
        page: { version: 1 },
        shape: { version: 4 },
        instance_presence: { version: 5 },
        pointer: { version: 1 }
      }
    }
  };
}

/**
 * 添加文本形状到 snapshot
 */
function addTextShape(
  snapshot: TldrawSnapshot,
  id: string,
  x: number,
  y: number,
  text: string,
  options: {
    size?: 'xs' | 's' | 'm' | 'l' | 'xl';
    font?: 'draw' | 'sans' | 'serif' | 'mono';
    color?: string;
    width?: number;
  } = {}
) {
  const {
    size = 'm',
    font = 'draw',
    color = 'black',
    width = 200
  } = options;

  snapshot.store[id] = {
    id,
    typeName: 'shape',
    type: 'text',
    x,
    y,
    rotation: 0,
    index: 'a1',
    parentId: 'page:page',
    props: {
      color,
      size,
      font,
      w: width,
      h: 32,
      autoSize: true,
      text
    }
  };
}

/**
 * 添加矩形形状到 snapshot
 */
function addRectShape(
  snapshot: TldrawSnapshot,
  id: string,
  x: number,
  y: number,
  width: number,
  height: number,
  options: {
    color?: string;
    fill?: string;
  } = {}
) {
  const { color = 'black', fill = 'none' } = options;

  snapshot.store[id] = {
    id,
    typeName: 'shape',
    type: 'geo',
    x,
    y,
    rotation: 0,
    index: 'a2',
    parentId: 'page:page',
    props: {
      w: width,
      h: height,
      geo: 'rectangle',
      color,
      fill,
      dash: 'draw',
      size: 'm'
    }
  };
}

/**
 * 简约日记模板
 */
function createSimpleDiaryTemplate(): CreateTemplateRequest {
  const snapshot = createBaseSnapshot();
  
  // 添加页面
  snapshot.store['page:page'] = {
    id: 'page:page',
    typeName: 'page',
    name: 'Page 1',
    index: 'a1'
  };

  // 标题
  addTextShape(snapshot, 'shape:title', 50, 50, '今日心情', {
    size: 'xl',
    font: 'draw',
    color: 'black',
    width: 300
  });

  // 日期
  addTextShape(snapshot, 'shape:date', 50, 120, '2024年的某一天', {
    size: 's',
    font: 'sans',
    color: 'grey',
    width: 200
  });

  // 正文
  addTextShape(snapshot, 'shape:content', 50, 180, '今天发生了很多有趣的事情，让我来记录一下这美好的时光...', {
    size: 'm',
    font: 'draw',
    color: 'black',
    width: 400
  });

  // 装饰性边框
  addRectShape(snapshot, 'shape:border', 30, 30, 440, 280, {
    color: 'yellow',
    fill: 'none'
  });

  return {
    name: '简约日记',
    description: '简洁优雅的日记模板，适合记录日常生活感悟',
    snapshot,
    isPublic: true
  };
}

/**
 * 创意便签模板
 */
function createStickyNotesTemplate(): CreateTemplateRequest {
  const snapshot = createBaseSnapshot();
  
  // 添加页面
  snapshot.store['page:page'] = {
    id: 'page:page',
    typeName: 'page',
    name: 'Page 1',
    index: 'a1'
  };

  // 第一张便签
  addRectShape(snapshot, 'shape:note1-bg', 50, 50, 180, 120, {
    color: 'yellow',
    fill: 'solid'
  });
  addTextShape(snapshot, 'shape:note1-text', 60, 80, '今天学到的', {
    size: 'm',
    font: 'draw',
    color: 'black',
    width: 160
  });

  // 第二张便签
  addRectShape(snapshot, 'shape:note2-bg', 250, 80, 180, 120, {
    color: 'green',
    fill: 'solid'
  });
  addTextShape(snapshot, 'shape:note2-text', 260, 110, '感谢的人和事', {
    size: 'm',
    font: 'draw',
    color: 'white',
    width: 160
  });

  // 第三张便签
  addRectShape(snapshot, 'shape:note3-bg', 150, 220, 180, 120, {
    color: 'red',
    fill: 'solid'
  });
  addTextShape(snapshot, 'shape:note3-text', 160, 250, '明天的计划', {
    size: 'm',
    font: 'draw',
    color: 'white',
    width: 160
  });

  return {
    name: '创意便签',
    description: '彩色便签风格，适合记录灵感和想法',
    snapshot,
    isPublic: true
  };
}

/**
 * 长图故事模板
 */
function createLongStoryTemplate(): CreateTemplateRequest {
  const snapshot = createBaseSnapshot();
  
  // 添加页面
  snapshot.store['page:page'] = {
    id: 'page:page',
    typeName: 'page',
    name: 'Page 1',
    index: 'a1'
  };

  // 标题
  addTextShape(snapshot, 'shape:title', 50, 30, '我的故事', {
    size: 'xl',
    font: 'serif',
    color: 'black',
    width: 400
  });

  // 第一段
  addTextShape(snapshot, 'shape:para1', 50, 100, '故事的开始总是充满未知，就像今天早上醒来的那一刻...', {
    size: 'm',
    font: 'serif',
    color: 'black',
    width: 400
  });

  // 分隔线
  addRectShape(snapshot, 'shape:divider1', 50, 180, 400, 2, {
    color: 'grey',
    fill: 'solid'
  });

  // 第二段
  addTextShape(snapshot, 'shape:para2', 50, 220, '午后的阳光透过窗棂，带来了温暖的感觉...', {
    size: 'm',
    font: 'serif',
    color: 'black',
    width: 400
  });

  // 第三段
  addTextShape(snapshot, 'shape:para3', 50, 320, '夜晚来临时，我回想起这一天的点点滴滴...', {
    size: 'm',
    font: 'serif',
    color: 'black',
    width: 400
  });

  return {
    name: '长图故事',
    description: '适合记录完整故事和长篇感悟的垂直布局模板',
    snapshot,
    isPublic: true
  };
}

/**
 * 所有内置模板
 */
export const BUILTIN_TEMPLATES: CreateTemplateRequest[] = [
  createSimpleDiaryTemplate(),
  createStickyNotesTemplate(),
  createLongStoryTemplate()
];

/**
 * 初始化内置模板到数据库
 */
export async function initBuiltinTemplates() {
  try {
    const { TemplateStorage } = await import('./template-storage');
    
    const result = await TemplateStorage.createBuiltinTemplates(BUILTIN_TEMPLATES);
    
    if (result.success) {
      console.log(`Successfully created ${result.data?.length} builtin templates`);
      return result.data;
    } else {
      console.error('Failed to create builtin templates:', result.error);
      return [];
    }
  } catch (error) {
    console.error('Error initializing builtin templates:', error);
    return [];
  }
}