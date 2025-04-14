import { create } from "zustand";
import { persist } from "zustand/middleware";

// Alice 配置类型
export interface AliceConfig {
  // 队列等待时间（毫秒）
  queueWaitingTime: number;
  // 打字速度（毫秒/字符）
  typingSpeed: number;
}

// 默认值
const DEFAULT_CONFIG: AliceConfig = {
  queueWaitingTime: 7000,
  typingSpeed: 200,
};

// Store 类型
interface AliceConfigStore {
  // 配置状态
  config: AliceConfig;
  // 更新单个配置项
  updateConfig: <K extends keyof AliceConfig>(key: K, value: AliceConfig[K]) => void;
  // 重置为默认配置
  resetConfig: () => void;
}

// 创建 store 并添加持久化
export const useAliceConfigStore = create<AliceConfigStore>()(
  persist(
    (set) => ({
      config: DEFAULT_CONFIG,
      updateConfig: (key, value) =>
        set((state) => ({
          config: {
            ...state.config,
            [key]: value,
          },
        })),
      resetConfig: () => set({ config: DEFAULT_CONFIG }),
    }),
    {
      name: "alice-config", // localStorage 存储的键名
    }
  )
);