# YellowBox Template System

This directory contains the template system for YellowBox that allows users to apply pre-designed templates to their diary entries with AI-generated text content.

## Overview

The template system consists of:

1. **Template Manager** (`template-manager.ts`) - Handles loading, parsing, and managing templates
2. **Template Processor** (`template-processor.ts`) - Processes diary content and applies it to templates
3. **Template Prompts** - LLM prompts for generating contextual text content
4. **UI Components** - Template selector and integration with TldrawQuoteCanvas

## How It Works

### 1. Template Structure
Templates are Tldraw JSON snapshots that contain:
- **Image assets** - Preserved as-is during template application
- **Text shapes** - Replaced with AI-generated content based on diary entry
- **Other shapes** - Preserved (rectangles, arrows, etc.)

### 2. Text Generation Process
1. Extract text shapes from template
2. Analyze diary content (conversation history, summary, metadata)
3. Generate contextually appropriate text for each text area using LLM
4. Replace template text while preserving styling and positioning
5. Load modified template into Tldraw editor

### 3. API Endpoints

#### `GET /api/templates/[templateId]`
Load template JSON data

#### `GET /api/yellowbox/templates`  
List available templates with metadata

#### `POST /api/yellowbox/apply-template`
Apply diary content to template
```typescript
{
  templateId: string;
  diaryContent: DiaryContent;
  language: 'zh' | 'en';
  preserveImages: boolean;
}
```

#### `POST /api/yellowbox/generate-template-text`
Generate text content using LLM
```typescript
{
  prompt: string;
  language: 'zh' | 'en';
  maxTokens: number;
}
```

## Usage in TldrawQuoteCanvas

Users can access templates via:
1. **Sparkles button** in the right control panel
2. **Template Selector dialog** opens showing available templates
3. **Select template** and click "Apply Template"
4. **AI processes** diary content and generates appropriate text
5. **Template loads** with new content while preserving images

## Available Templates

### long-photo-1
- **Name**: 长图模板 1
- **Description**: 适合长篇日记的图文混排模板，包含多个文本区域和图片位置
- **Text Areas**: 5 text shapes with different sizes and positions
- **Images**: Multiple image placeholders
- **Tags**: 长图, 图文混排, 日记, 多图

## Adding New Templates

1. Create template in Tldraw and export as JSON
2. Place JSON file in `/app/yellowbox/sample/[template-id].json`
3. Add template metadata in `TemplateManager.getTemplateName()`, `getTemplateDescription()`, and `getTemplateTags()`
4. Update `allowedTemplates` in `/api/templates/[templateId]/route.ts`

## Text Generation Strategy

The system uses different prompting strategies based on text shape properties:

- **Title text** (size: xl): Generate concise, engaging titles
- **Large text** (size: l): Generate detailed, story-like content
- **Regular text**: Generate supplementary or summary content

Text length is automatically controlled based on the original template text length and text area dimensions.

## Error Handling

- Template not found → Graceful fallback
- LLM generation failure → Use diary excerpts as fallback
- Network errors → User-friendly error messages
- Empty diary content → Validation with helpful messaging

## Performance Considerations

- Templates are cached after first load
- Text generation is done in sequence to avoid API rate limits  
- Large templates are processed with appropriate timeouts
- UI shows loading states during processing