"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAliceConfigStore } from "@/app/store/alice-config";

export default function AliceConfigPage() {
  // 使用 store
  const { config, updateConfig, resetConfig } = useAliceConfigStore();

  // 本地状态，用于表单输入
  const [queueWaitingTime, setQueueWaitingTime] = useState(config.queueWaitingTime.toString());
  const [typingSpeed, setTypingSpeed] = useState(config.typingSpeed.toString());
  const [isSaved, setIsSaved] = useState(false);

  // 当 store 中的配置变化时更新本地状态
  useEffect(() => {
    setQueueWaitingTime(config.queueWaitingTime.toString());
    setTypingSpeed(config.typingSpeed.toString());
  }, [config]);

  // 处理表单提交
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 更新 store
    updateConfig("queueWaitingTime", parseInt(queueWaitingTime) || 3000);
    updateConfig("typingSpeed", parseInt(typingSpeed) || 50);

    // 显示保存成功提示
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  // 重置配置
  const handleReset = () => {
    resetConfig();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="flex-1 p-8 overflow-auto">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Alice Configuration</h1>

        <div className="bg-card p-6 rounded-lg shadow-sm border">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="queueWaitingTime" className="block text-sm font-medium mb-1">
                  Message Queue Wait Time (ms)
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    id="queueWaitingTime"
                    type="number"
                    min="500"
                    max="10000"
                    step="100"
                    value={queueWaitingTime}
                    onChange={(e) => setQueueWaitingTime(e.target.value)}
                    className="flex-1"
                  />
                  <span className="text-sm text-muted-foreground">ms</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Time to wait after user stops typing before processing the message queue (default: 7000)
                </p>
              </div>

              <div>
                <label htmlFor="typingSpeed" className="block text-sm font-medium mb-1">
                  Typing Speed (ms/character)
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    id="typingSpeed"
                    type="number"
                    min="50"
                    max="500"
                    step="10"
                    value={typingSpeed}
                    onChange={(e) => setTypingSpeed(e.target.value)}
                    className="flex-1"
                  />
                  <span className="text-sm text-muted-foreground">ms/char</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Delay time per character display, lower values show text faster (default: 200)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-2">
              <Button type="submit">Save Settings</Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
              >
                Reset to Default
              </Button>
              {isSaved && (
                <span className="text-sm text-green-500 animate-in fade-in">
                  Settings saved
                </span>
              )}
            </div>
          </form>

          <div className="mt-8 pt-4 border-t">
            <h2 className="text-lg font-medium mb-2">Current Configuration</h2>
            <div className="bg-muted p-4 rounded text-sm font-mono overflow-auto">
              <pre>{JSON.stringify(config, null, 2)}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}