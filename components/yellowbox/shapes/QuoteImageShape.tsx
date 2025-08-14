"use client";

import {
  BaseBoxShapeUtil,
  HTMLContainer,
  Rectangle2d,
  T,
  TLBaseShape,
  resizeBox,
  TLResizeInfo,
} from 'tldraw';

// Define the quote image shape type
export type QuoteImageShape = TLBaseShape<
  'quote-image',
  {
    w: number;
    h: number;
    url: string;
    opacity: number;
    borderRadius: number;
  }
>;

// Define the props schema
export const quoteImageShapeProps = {
  w: T.number,
  h: T.number,
  url: T.string,
  opacity: T.number,
  borderRadius: T.number,
};

// Create the shape utility class
export class QuoteImageShapeUtil extends BaseBoxShapeUtil<QuoteImageShape> {
  static override type = 'quote-image' as const;
  static override props = quoteImageShapeProps;

  // Default props
  getDefaultProps(): QuoteImageShape['props'] {
    return {
      w: 200,
      h: 200,
      url: '',
      opacity: 1,
      borderRadius: 8,
    };
  }

  // Get geometry for the shape
  getGeometry(shape: QuoteImageShape) {
    return new Rectangle2d({
      width: shape.props.w,
      height: shape.props.h,
      isFilled: true,
    });
  }

  // React component for rendering the shape
  component(shape: QuoteImageShape) {
    const {
      w,
      h,
      url,
      opacity,
      borderRadius,
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
            padding: '4px',
            backgroundColor: '#ffffff',
            borderRadius: `${borderRadius + 4}px`,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {url ? (
            <img
              src={url}
              alt="Quote image"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: `${borderRadius}px`,
                opacity,
                userSelect: 'none',
                pointerEvents: 'none',
              }}
              draggable={false}
              onError={(e) => {
                // Handle image load error
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = `
                    <div style="
                      width: 100%;
                      height: 100%;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      background-color: #f3f4f6;
                      color: #6b7280;
                      font-size: 14px;
                      border-radius: ${borderRadius}px;
                    ">
                      Image not found
                    </div>
                  `;
                }
              }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f3f4f6',
                color: '#6b7280',
                fontSize: '14px',
                borderRadius: `${borderRadius}px`,
              }}
            >
              No Image
            </div>
          )}
        </div>
      </HTMLContainer>
    );
  }

  // Indicator component for when the shape is selected
  indicator(shape: QuoteImageShape) {
    return (
      <rect
        width={shape.props.w}
        height={shape.props.h}
        rx={shape.props.borderRadius + 4}
        ry={shape.props.borderRadius + 4}
        fill="none"
        stroke="var(--color-selected)"
        strokeWidth={2}
        strokeDasharray="4 4"
      />
    );
  }

  // Handle resizing
  override onResize = (shape: QuoteImageShape, info: TLResizeInfo<QuoteImageShape>) => {
    return resizeBox(shape, info);
  };

  // Check if the shape can be resized
  canResize = () => true;

  // Check if the shape can be cropped
  canCrop = () => false;
}