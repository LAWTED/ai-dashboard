"use client";

import {
  BaseBoxShapeUtil,
  HTMLContainer,
  Rectangle2d,
  T,
  TLBaseShape,
  resizeBox,
} from 'tldraw';
import HolographicImageSticker from '../HolographicImageSticker';

// Define the quote image sticker shape type
export type QuoteImageStickerShape = TLBaseShape<
  'quote-image-sticker',
  {
    w: number;
    h: number;
    stickerId: string;
    stickerName: string;
  }
>;

// Define the props schema
export const quoteImageStickerShapeProps = {
  w: T.number,
  h: T.number,
  stickerId: T.string,
  stickerName: T.string,
};

// Create the shape utility class
export class QuoteImageStickerShapeUtil extends BaseBoxShapeUtil<QuoteImageStickerShape> {
  static override type = 'quote-image-sticker' as const;
  static override props = quoteImageStickerShapeProps;

  // Default props
  getDefaultProps(): QuoteImageStickerShape['props'] {
    return {
      w: 200,
      h: 200,
      stickerId: 'holographic-lightning',
      stickerName: 'Holographic Lightning',
    };
  }

  // Get geometry for the shape
  getGeometry(shape: QuoteImageStickerShape) {
    return new Rectangle2d({
      width: shape.props.w,
      height: shape.props.h,
      isFilled: true,
    });
  }

  // React component for rendering the shape
  component(shape: QuoteImageStickerShape) {
    const {
      w,
      h,
      stickerId,
      stickerName,
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
            transition: 'all 0.2s ease-in-out',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.filter = 'drop-shadow(0 10px 20px rgba(0, 0, 0, 0.2))';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.filter = 'none';
          }}
          title={stickerName}
        >
          {/* 使用 HolographicImageSticker 组件 */}
          <div
            style={{
              width: '100%',
              height: '100%',
              position: 'relative',
              overflow: 'hidden',
              borderRadius: '12px',
            }}
          >
            <HolographicImageSticker 
              className="w-full h-full object-contain"
              style={{
                userSelect: 'none',
                pointerEvents: 'none',
              }}
            />
          </div>
        </div>
      </HTMLContainer>
    );
  }

  // Indicator component for when the shape is selected
  indicator(shape: QuoteImageStickerShape) {
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
  override onResize = (shape: QuoteImageStickerShape, info: any) => {
    const resizedShape = resizeBox(shape, info);
    // Keep aspect ratio square for stickers
    const size = Math.min(resizedShape.props.w, resizedShape.props.h);
    return {
      ...resizedShape,
      props: {
        ...resizedShape.props,
        w: size,
        h: size,
      },
    };
  };

  // Check if the shape can be resized
  canResize = () => true;

  // Check if the shape can be cropped
  canCrop = () => false;
}