"use client";

import {
  BaseBoxShapeUtil,
  HTMLContainer,
  Rectangle2d,
  T,
  TLBaseShape,
  resizeBox,
} from 'tldraw';

// Define the quote emoji shape type
export type QuoteEmojiShape = TLBaseShape<
  'quote-emoji',
  {
    w: number;
    h: number;
    emoji: string;
    size: number;
  }
>;

// Define the props schema
export const quoteEmojiShapeProps = {
  w: T.number,
  h: T.number,
  emoji: T.string,
  size: T.number,
};

// Create the shape utility class
export class QuoteEmojiShapeUtil extends BaseBoxShapeUtil<QuoteEmojiShape> {
  static override type = 'quote-emoji' as const;
  static override props = quoteEmojiShapeProps;

  // Default props
  getDefaultProps(): QuoteEmojiShape['props'] {
    return {
      w: 64,
      h: 64,
      emoji: '😊',
      size: 32,
    };
  }

  // Get geometry for the shape
  getGeometry(shape: QuoteEmojiShape) {
    return new Rectangle2d({
      width: shape.props.w,
      height: shape.props.h,
      isFilled: true,
    });
  }

  // React component for rendering the shape
  component(shape: QuoteEmojiShape) {
    const {
      w,
      h,
      emoji,
      size,
    } = shape.props;

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
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#ffffff',
            border: '2px solid #fde68a', // yellow-200
            borderRadius: '12px',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
            transition: 'all 0.2s ease-in-out',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#fbbf24'; // yellow-400
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#fde68a'; // yellow-200
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <span
            style={{
              fontSize: `${size}px`,
              lineHeight: '1',
              userSelect: 'none',
              fontFamily: 'Apple Color Emoji, Segoe UI Emoji, NotoColorEmoji, Segoe UI Symbol, Android Emoji, EmojiSymbols',
            }}
          >
            {emoji || '😊'}
          </span>
        </div>
      </HTMLContainer>
    );
  }

  // Indicator component for when the shape is selected
  indicator(shape: QuoteEmojiShape) {
    return (
      <rect
        width={shape.props.w}
        height={shape.props.h}
        rx={12}
        ry={12}
        fill="none"
        stroke="var(--color-selected)"
        strokeWidth={2}
        strokeDasharray="4 4"
      />
    );
  }

  // Handle resizing
  override onResize = (shape: QuoteEmojiShape, info: Parameters<BaseBoxShapeUtil<QuoteEmojiShape>['onResize']>[1]) => {
    const resizedShape = resizeBox(shape, info);
    // Keep emoji size proportional to container size
    const newSize = Math.min(resizedShape.props.w, resizedShape.props.h) * 0.5;
    return {
      ...resizedShape,
      props: {
        ...resizedShape.props,
        size: Math.max(16, Math.min(72, newSize)),
      },
    };
  };

  // Check if the shape can be resized
  canResize = () => true;

  // Check if the shape can be cropped
  canCrop = () => false;
}