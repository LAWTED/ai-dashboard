"use client";

import {
  BaseBoxShapeUtil,
  DefaultColorTheme,
  HTMLContainer,
  Rectangle2d,
  ShapeUtil,
  T,
  TLBaseShape,
  TLDefaultColorTheme,
  resizeBox,
  structuredClone,
  getDefaultColorTheme,
} from 'tldraw';

// Define the quote text shape type
export type QuoteTextShape = TLBaseShape<
  'quote-text',
  {
    w: number;
    h: number;
    text: string;
    color: 'user' | 'ai' | 'black';
    fontSize: number;
    fontFamily: 'serif' | 'sans' | 'mono';
    fontWeight: 'normal' | 'bold';
  }
>;

// Define the props schema
export const quoteTextShapeProps = {
  w: T.number,
  h: T.number,
  text: T.string,
  color: T.literalEnum('user', 'ai', 'black'),
  fontSize: T.number,
  fontFamily: T.literalEnum('serif', 'sans', 'mono'),
  fontWeight: T.literalEnum('normal', 'bold'),
};

// Create the shape utility class
export class QuoteTextShapeUtil extends BaseBoxShapeUtil<QuoteTextShape> {
  static override type = 'quote-text' as const;
  static override props = quoteTextShapeProps;

  // Default props
  getDefaultProps(): QuoteTextShape['props'] {
    return {
      w: 200,
      h: 60,
      text: '',
      color: 'black',
      fontSize: 16,
      fontFamily: 'serif',
      fontWeight: 'normal',
    };
  }

  // Get geometry for the shape
  getGeometry(shape: QuoteTextShape) {
    return new Rectangle2d({
      width: shape.props.w,
      height: shape.props.h,
      isFilled: true,
    });
  }

  // Get color for different types
  private getColorStyle(color: 'user' | 'ai' | 'black') {
    switch (color) {
      case 'user':
        return {
          backgroundColor: '#dbeafe', // blue-100
          borderColor: '#bfdbfe', // blue-200
          color: '#1e40af', // blue-800
        };
      case 'ai':
        return {
          backgroundColor: '#dcfce7', // green-100
          borderColor: '#bbf7d0', // green-200
          color: '#166534', // green-800
        };
      default:
        return {
          backgroundColor: '#f9fafb', // gray-50
          borderColor: '#e5e7eb', // gray-200
          color: '#111827', // gray-900
        };
    }
  }

  // Get font family CSS
  private getFontFamily(fontFamily: 'serif' | 'sans' | 'mono') {
    switch (fontFamily) {
      case 'serif':
        return 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif';
      case 'sans':
        return 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
      case 'mono':
        return 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo';
      default:
        return 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif';
    }
  }

  // React component for rendering the shape
  component(shape: QuoteTextShape) {
    const {
      w,
      h,
      text,
      color,
      fontSize,
      fontFamily,
      fontWeight,
    } = shape.props;

    const colorStyle = this.getColorStyle(color);
    const fontFamilyCSS = this.getFontFamily(fontFamily);

    return (
      <HTMLContainer
        style={{
          width: w,
          height: h,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'all',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            padding: '12px',
            borderRadius: '8px',
            border: `2px solid ${colorStyle.borderColor}`,
            backgroundColor: colorStyle.backgroundColor,
            color: colorStyle.color,
            fontSize: `${fontSize}px`,
            fontFamily: fontFamilyCSS,
            fontWeight,
            lineHeight: '1.6',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            wordWrap: 'break-word',
            userSelect: 'none',
          }}
        >
          {text || 'Text'}
        </div>
      </HTMLContainer>
    );
  }

  // Indicator component for when the shape is selected
  indicator(shape: QuoteTextShape) {
    return (
      <rect
        width={shape.props.w}
        height={shape.props.h}
        rx={8}
        ry={8}
        fill="none"
        stroke="var(--color-selected)"
        strokeWidth={2}
        strokeDasharray="4 4"
      />
    );
  }

  // Handle resizing
  override onResize = (shape: QuoteTextShape, info: any) => {
    return resizeBox(shape, info);
  };

  // Check if the shape can be resized
  canResize = () => true;

  // Check if the shape can be cropped
  canCrop = () => false;
}