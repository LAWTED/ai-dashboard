/**
 * 内置模板数据 - MVP版本
 * 包含硬编码的模板列表和获取函数
 */

import { toRichText } from '@tldraw/tlschema';
import { Template, TldrawSnapshot } from './template-types';

type TldrawColor =
  | 'black'
  | 'grey'
  | 'light-violet'
  | 'violet'
  | 'blue'
  | 'light-blue'
  | 'yellow'
  | 'orange'
  | 'green'
  | 'light-green'
  | 'light-red'
  | 'red'
  | 'white';

const ALLOWED_COLORS: Record<string, TldrawColor> = {
  black: 'black',
  grey: 'grey',
  'light-violet': 'light-violet',
  violet: 'violet',
  blue: 'blue',
  'light-blue': 'light-blue',
  yellow: 'yellow',
  orange: 'orange',
  green: 'green',
  'light-green': 'light-green',
  'light-red': 'light-red',
  red: 'red',
  white: 'white',
};

function normalizeColor(color?: string): TldrawColor {
  if (!color) {
    return 'black';
  }

  const lower = color.toLowerCase();

  if (lower in ALLOWED_COLORS) {
    return ALLOWED_COLORS[lower];
  }

  switch (lower) {
    case 'purple':
      return 'violet';
    case 'light-purple':
    case 'lavender':
      return 'light-violet';
    case 'dark-blue':
      return 'blue';
    case 'dark-green':
      return 'green';
    case 'dark-grey':
    case 'gray':
      return 'grey';
    default:
      return 'black';
  }
}

/**
 * 创建基础的 Tldraw snapshot 结构
 */
function createBaseSnapshot(): TldrawSnapshot {
  return {
    store: {
      'page:page': {
        id: 'page:page',
        typeName: 'page',
        name: 'Page 1',
        index: 'a1'
      }
    },
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
 * 添加文本shape到snapshot
 */
function addTextShape(
  snapshot: TldrawSnapshot,
  id: string,
  x: number,
  y: number,
  text: string,
  options: {
    size?: string;
    font?: string;
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
    index: generateIndex(Object.keys(snapshot.store).length),
    parentId: 'page:page',
    props: {
      color: normalizeColor(color),
      size,
      font,
      textAlign: 'start',
      w: width,
      autoSize: true,
      scale: 1,
      richText: toRichText(text)
    }
  };
}

/**
 * 生成索引
 */
function generateIndex(count: number): string {
  return `a${count + 1}`;
}

/**
 * 创建简约日记模板
 */
function createSimpleDiaryTemplate(): Template {
  const snapshot = createBaseSnapshot();
  
  // Title
  addTextShape(snapshot, 'shape:title', 100, 80, "Today's Mood", {
    size: 'xl',
    font: 'draw',
    color: 'black',
    width: 300
  });

  // Date line
  addTextShape(snapshot, 'shape:date', 100, 140, 'A beautiful day in 2024', {
    size: 's',
    font: 'sans',
    color: 'grey',
    width: 250
  });

  // Main content
  addTextShape(snapshot, 'shape:content', 100, 200, 'So many delightful moments today; time to capture the highlights.', {
    size: 'm',
    font: 'draw',
    color: 'black',
    width: 450
  });

  // Reflection
  addTextShape(snapshot, 'shape:reflection', 100, 280, 'Tiny joys worth saving.', {
    size: 's',
    font: 'serif',
    color: 'blue',
    width: 350
  });

  return {
    id: 'simple-diary',
    name: 'Simple Journal',
    description: 'Clean, elegant layout for everyday reflections.',
    snapshot
  };
}

/**
 * 创建温馨便签模板
 */
function createWarmNotesTemplate(): Template {
  const snapshot = createBaseSnapshot();
  
  // Main title
  addTextShape(snapshot, 'shape:main-title', 80, 60, 'Warm Moments', {
    size: 'xl',
    font: 'draw',
    color: 'orange',
    width: 200
  });

  // Gratitude prompt
  addTextShape(snapshot, 'shape:gains', 80, 140, "Today's cherished memories", {
    size: 'm',
    font: 'draw',
    color: 'green',
    width: 250
  });

  // Thankful prompt
  addTextShape(snapshot, 'shape:gratitude', 350, 140, 'Grateful for every little thing', {
    size: 'm',
    font: 'draw',
    color: 'violet',
    width: 250
  });

  // Tomorrow prompt
  addTextShape(snapshot, 'shape:tomorrow', 80, 240, "Looking forward to tomorrow's fresh start", {
    size: 'm',
    font: 'draw',
    color: 'red',
    width: 220
  });

  // Mood summary
  addTextShape(snapshot, 'shape:mood', 350, 240, 'Feeling fantastic', {
    size: 'l',
    font: 'draw',
    color: 'yellow',
    width: 150
  });

  return {
    id: 'warm-notes',
    name: 'Warm Notes',
    description: 'Colorful sticky-note style for gratitude and joyful highlights.',
    snapshot
  };
}

/**
 * 创建文艺长文模板
 */
function createLiteraryTemplate(): Template {
  const snapshot = createBaseSnapshot();
  
  // Poetic title
  addTextShape(snapshot, 'shape:poetic-title', 120, 70, 'The beauty of time in song', {
    size: 'xl',
    font: 'serif',
    color: 'black',
    width: 350
  });

  // First paragraph
  addTextShape(snapshot, 'shape:para1', 120, 130, 'Morning light spilled through the window, hinting at unexpected stories to unfold.', {
    size: 'm',
    font: 'serif',
    color: 'black',
    width: 500
  });

  // Second paragraph
  addTextShape(snapshot, 'shape:para2', 120, 190, 'An afternoon breeze carried soft florals, settling the heart into a quiet calm.', {
    size: 'm',
    font: 'serif',
    color: 'black',
    width: 500
  });

  // Closing reflection
  addTextShape(snapshot, 'shape:ending', 120, 250, 'May time stay kind and this gentle rhythm remain.', {
    size: 'm',
    font: 'serif',
    color: 'grey',
    width: 400
  });

  return {
    id: 'literary-long',
    name: 'Literary Longform',
    description: 'Ideal for thoughtful, poetic long-form entries.',
    snapshot
  };
}

/**
 * 所有内置模板
 */
const BUILTIN_TEMPLATES: Template[] = [
  createSimpleDiaryTemplate(),
  createWarmNotesTemplate(),
  createLiteraryTemplate()
];

/**
 * 获取所有模板
 */
export function getAllTemplates(): Template[] {
  return BUILTIN_TEMPLATES;
}

/**
 * 根据ID获取模板
 */
export function getTemplateById(id: string): Template | null {
  return BUILTIN_TEMPLATES.find(template => template.id === id) || null;
}

/**
 * 获取模板总数
 */
export function getTemplateCount(): number {
  return BUILTIN_TEMPLATES.length;
}
