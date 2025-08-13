// Import all the shape utils first
import { 
  QuoteTextShapeUtil, 
  type QuoteTextShape, 
  quoteTextShapeProps 
} from './QuoteTextShape';

import { 
  QuoteImageShapeUtil, 
  type QuoteImageShape, 
  quoteImageShapeProps 
} from './QuoteImageShape';

import { 
  QuoteEmojiShapeUtil, 
  type QuoteEmojiShape, 
  quoteEmojiShapeProps 
} from './QuoteEmojiShape';

import { 
  QuoteImageStickerShapeUtil, 
  type QuoteImageStickerShape, 
  quoteImageStickerShapeProps 
} from './QuoteImageStickerShape';

// Then export them
export { 
  QuoteTextShapeUtil, 
  type QuoteTextShape, 
  quoteTextShapeProps 
};

export { 
  QuoteImageShapeUtil, 
  type QuoteImageShape, 
  quoteImageShapeProps 
};

export { 
  QuoteEmojiShapeUtil, 
  type QuoteEmojiShape, 
  quoteEmojiShapeProps 
};

export { 
  QuoteImageStickerShapeUtil, 
  type QuoteImageStickerShape, 
  quoteImageStickerShapeProps 
};

// Union type for all custom shapes
export type QuoteCustomShape = 
  | QuoteTextShape 
  | QuoteImageShape 
  | QuoteEmojiShape 
  | QuoteImageStickerShape;

// Array of all custom shape utils for registration
export const customShapeUtils = [
  QuoteTextShapeUtil,
  QuoteImageShapeUtil,
  QuoteEmojiShapeUtil,
  QuoteImageStickerShapeUtil,
];