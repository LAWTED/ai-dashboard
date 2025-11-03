"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
  CustomSystemPrompt,
  SystemPromptSettings,
  PromptContext as PromptContextType,
} from '@/lib/yellowbox/prompt-types';
import {
  getAllBuiltInPrompts,
  getPromptById as getBuiltInPromptById,
  getDefaultPrompt,
} from '@/lib/yellowbox/prompt-presets';

interface PromptContextValue {
  settings: SystemPromptSettings;
  updateSettings: (settings: Partial<SystemPromptSettings>) => void;

  // 获取当前激活的 prompt
  getActivePrompt: (context: PromptContextType) => CustomSystemPrompt;

  // CRUD 操作
  createPrompt: (prompt: Omit<CustomSystemPrompt, 'id' | 'createdAt' | 'updatedAt' | 'isBuiltIn'>) => void;
  updatePrompt: (id: string, updates: Partial<CustomSystemPrompt>) => void;
  deletePrompt: (id: string) => void;

  // 所有可用的 prompts（内置 + 自定义）
  allPrompts: CustomSystemPrompt[];

  // 根据 ID 获取 prompt
  getPromptById: (id: string) => CustomSystemPrompt | undefined;
}

const YellowBoxPromptContext = createContext<PromptContextValue | null>(null);

const STORAGE_KEY = 'yellowbox-prompt-settings';

interface YellowBoxPromptProviderProps {
  children: ReactNode;
}

export function YellowBoxPromptProvider({ children }: YellowBoxPromptProviderProps) {
  const [settings, setSettings] = useState<SystemPromptSettings>(() => {
    // 初始化默认设置
    const defaultSettings: SystemPromptSettings = {
      defaultDiaryPromptId: 'original',
      defaultTemplatePromptId: 'original',
      customPrompts: [],
    };
    return defaultSettings;
  });

  const [isInitialized, setIsInitialized] = useState(false);

  // 从 localStorage 加载设置
  useEffect(() => {
    if (typeof window !== 'undefined' && !isInitialized) {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as SystemPromptSettings;
          setSettings(parsed);
        }
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to load prompt settings:', error);
        setIsInitialized(true);
      }
    }
  }, [isInitialized]);

  // 保存设置到 localStorage
  const saveSettings = useCallback((newSettings: SystemPromptSettings) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
      } catch (error) {
        console.error('Failed to save prompt settings:', error);
      }
    }
  }, []);

  // 更新设置
  const updateSettings = useCallback(
    (updates: Partial<SystemPromptSettings>) => {
      setSettings((prev) => {
        const newSettings = { ...prev, ...updates };
        saveSettings(newSettings);
        return newSettings;
      });
    },
    [saveSettings]
  );

  // 获取所有 prompts（内置 + 自定义）
  const allPrompts = React.useMemo(() => {
    const builtIn = getAllBuiltInPrompts();
    return [...builtIn, ...settings.customPrompts];
  }, [settings.customPrompts]);

  // 根据 ID 获取 prompt
  const getPromptByIdFn = useCallback(
    (id: string): CustomSystemPrompt | undefined => {
      // 先从内置中查找
      const builtIn = getBuiltInPromptById(id);
      if (builtIn) return builtIn;

      // 再从自定义中查找
      return settings.customPrompts.find((p) => p.id === id);
    },
    [settings.customPrompts]
  );

  // 获取当前激活的 prompt
  const getActivePrompt = useCallback(
    (context: PromptContextType): CustomSystemPrompt => {
      const promptId =
        context === 'diary' ? settings.defaultDiaryPromptId : settings.defaultTemplatePromptId;

      const prompt = getPromptByIdFn(promptId);
      return prompt || getDefaultPrompt();
    },
    [settings.defaultDiaryPromptId, settings.defaultTemplatePromptId, getPromptByIdFn]
  );

  // 创建自定义 prompt
  const createPrompt = useCallback(
    (prompt: Omit<CustomSystemPrompt, 'id' | 'createdAt' | 'updatedAt' | 'isBuiltIn'>) => {
      const newPrompt: CustomSystemPrompt = {
        ...prompt,
        id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        isBuiltIn: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setSettings((prev) => {
        const newSettings = {
          ...prev,
          customPrompts: [...prev.customPrompts, newPrompt],
        };
        saveSettings(newSettings);
        return newSettings;
      });
    },
    [saveSettings]
  );

  // 更新 prompt
  const updatePrompt = useCallback(
    (id: string, updates: Partial<CustomSystemPrompt>) => {
      setSettings((prev) => {
        const newCustomPrompts = prev.customPrompts.map((p) =>
          p.id === id
            ? {
                ...p,
                ...updates,
                updatedAt: new Date().toISOString(),
              }
            : p
        );

        const newSettings = {
          ...prev,
          customPrompts: newCustomPrompts,
        };
        saveSettings(newSettings);
        return newSettings;
      });
    },
    [saveSettings]
  );

  // 删除 prompt
  const deletePrompt = useCallback(
    (id: string) => {
      setSettings((prev) => {
        const newCustomPrompts = prev.customPrompts.filter((p) => p.id !== id);

        // 如果删除的是当前激活的 prompt，切换到默认
        let newDefaultDiaryPromptId = prev.defaultDiaryPromptId;
        let newDefaultTemplatePromptId = prev.defaultTemplatePromptId;

        if (id === prev.defaultDiaryPromptId) {
          newDefaultDiaryPromptId = 'original';
        }
        if (id === prev.defaultTemplatePromptId) {
          newDefaultTemplatePromptId = 'original';
        }

        const newSettings = {
          ...prev,
          customPrompts: newCustomPrompts,
          defaultDiaryPromptId: newDefaultDiaryPromptId,
          defaultTemplatePromptId: newDefaultTemplatePromptId,
        };
        saveSettings(newSettings);
        return newSettings;
      });
    },
    [saveSettings]
  );

  if (!isInitialized) {
    return null;
  }

  const contextValue: PromptContextValue = {
    settings,
    updateSettings,
    getActivePrompt,
    createPrompt,
    updatePrompt,
    deletePrompt,
    allPrompts,
    getPromptById: getPromptByIdFn,
  };

  return (
    <YellowBoxPromptContext.Provider value={contextValue}>
      {children}
    </YellowBoxPromptContext.Provider>
  );
}

export function useYellowBoxPrompt() {
  const context = useContext(YellowBoxPromptContext);
  if (!context) {
    throw new Error('useYellowBoxPrompt must be used within a YellowBoxPromptProvider');
  }
  return context;
}
