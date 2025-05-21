export * from './types';
export * from './mbti';
export * from './food';
export * from './company';

import { GameConfig } from './types';
import { mbtiGameConfig } from './mbti';
import { foodGameConfig } from './food';
import { companyGameConfig } from './company';

// Combined game configs for frontend
export const gameConfigs: Record<string, GameConfig> = {
  mbti: mbtiGameConfig,
  food: foodGameConfig,
  company: companyGameConfig,
};

// For API
export { mbtiApiConfig } from './mbti';
export { foodApiConfig } from './food';
export { companyApiConfig } from './company';