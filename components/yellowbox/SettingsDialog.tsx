"use client";

import { useState, useEffect } from "react";
import { Settings, RotateCcw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  DEFAULT_PROMPTS,
  loadCustomPrompts,
  saveCustomPrompts,
  resetToDefaultPrompts,
  type CustomPrompts,
} from "@/lib/yellowbox/prompts";

interface SettingsDialogProps {
  onSave?: () => void;
}

export function SettingsDialog({ onSave }: SettingsDialogProps) {
  const [open, setOpen] = useState(false);
  const [prompts, setPrompts] = useState<CustomPrompts>({
    morning: DEFAULT_PROMPTS.morning,
    daytime: DEFAULT_PROMPTS.daytime,
    daytime_after_3: DEFAULT_PROMPTS.daytime_after_3,
    evening: DEFAULT_PROMPTS.evening,
  });

  // Load custom prompts when dialog opens
  useEffect(() => {
    if (open) {
      const customPrompts = loadCustomPrompts();
      if (customPrompts) {
        setPrompts({
          morning: customPrompts.morning || DEFAULT_PROMPTS.morning,
          daytime: customPrompts.daytime || DEFAULT_PROMPTS.daytime,
          daytime_after_3: customPrompts.daytime_after_3 || DEFAULT_PROMPTS.daytime_after_3,
          evening: customPrompts.evening || DEFAULT_PROMPTS.evening,
        });
      } else {
        setPrompts({
          morning: DEFAULT_PROMPTS.morning,
          daytime: DEFAULT_PROMPTS.daytime,
          daytime_after_3: DEFAULT_PROMPTS.daytime_after_3,
          evening: DEFAULT_PROMPTS.evening,
        });
      }
    }
  }, [open]);

  const handleSave = () => {
    // Validate that no prompt is empty
    if (!prompts.morning?.trim() || !prompts.daytime?.trim() ||
        !prompts.daytime_after_3?.trim() || !prompts.evening?.trim()) {
      toast.error("所有提示词不能为空");
      return;
    }

    saveCustomPrompts(prompts);
    toast.success("设置已保存");
    setOpen(false);
    onSave?.();
  };

  const handleReset = (type: keyof CustomPrompts) => {
    setPrompts((prev) => ({
      ...prev,
      [type]: DEFAULT_PROMPTS[type],
    }));
    toast.success("已恢复默认设置");
  };

  const handleResetAll = () => {
    if (window.confirm("确定要重置所有设置为默认值吗？")) {
      resetToDefaultPrompts();
      setPrompts({
        morning: DEFAULT_PROMPTS.morning,
        daytime: DEFAULT_PROMPTS.daytime,
        daytime_after_3: DEFAULT_PROMPTS.daytime_after_3,
        evening: DEFAULT_PROMPTS.evening,
      });
      toast.success("已重置所有设置");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-[#3B3109] hover:bg-yellow-300/50"
          title="设置"
        >
          <Settings className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-[#FFF9E6] border-[#E4BE10]">
        <DialogHeader>
          <DialogTitle className="text-[#3B3109] flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Yellow Box 设置
          </DialogTitle>
          <DialogDescription className="text-[#3B3109]/70">
            自定义不同时间段的 AI 系统提示词
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Morning Prompt */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="morning" className="text-[#3B3109] font-semibold flex items-center gap-2">
                🌅 Morning Prompt ({"<"} 9:00)
              </Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleReset("morning")}
                className="text-[#3B3109] hover:bg-yellow-300/50 h-7 px-2"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                恢复默认
              </Button>
            </div>
            <Textarea
              id="morning"
              value={prompts.morning}
              onChange={(e) =>
                setPrompts((prev) => ({ ...prev, morning: e.target.value }))
              }
              className="min-h-[120px] bg-white border-[#E4BE10] text-[#3B3109] font-mono text-xs"
              placeholder="输入 morning 时段的系统提示词..."
            />
          </div>

          {/* Daytime Prompt (first 3 messages) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="daytime" className="text-[#3B3109] font-semibold flex items-center gap-2">
                ☀️ Daytime Prompt - 前3条消息 (9:00 - 21:00)
              </Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleReset("daytime")}
                className="text-[#3B3109] hover:bg-yellow-300/50 h-7 px-2"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                恢复默认
              </Button>
            </div>
            <Textarea
              id="daytime"
              value={prompts.daytime}
              onChange={(e) =>
                setPrompts((prev) => ({ ...prev, daytime: e.target.value }))
              }
              className="min-h-[120px] bg-white border-[#E4BE10] text-[#3B3109] font-mono text-xs"
              placeholder="输入 daytime 时段前3条消息的系统提示词..."
            />
          </div>

          {/* Daytime Prompt (after 3 messages) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="daytime_after_3" className="text-[#3B3109] font-semibold flex items-center gap-2">
                ☀️ Daytime Prompt - 3条后 (9:00 - 21:00)
              </Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleReset("daytime_after_3")}
                className="text-[#3B3109] hover:bg-yellow-300/50 h-7 px-2"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                恢复默认
              </Button>
            </div>
            <Textarea
              id="daytime_after_3"
              value={prompts.daytime_after_3}
              onChange={(e) =>
                setPrompts((prev) => ({ ...prev, daytime_after_3: e.target.value }))
              }
              className="min-h-[120px] bg-white border-[#E4BE10] text-[#3B3109] font-mono text-xs"
              placeholder="输入 daytime 时段3条消息后的系统提示词..."
            />
          </div>

          {/* Evening Prompt */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="evening" className="text-[#3B3109] font-semibold flex items-center gap-2">
                🌙 Evening Prompt ({">="} 21:00)
              </Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleReset("evening")}
                className="text-[#3B3109] hover:bg-yellow-300/50 h-7 px-2"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                恢复默认
              </Button>
            </div>
            <Textarea
              id="evening"
              value={prompts.evening}
              onChange={(e) =>
                setPrompts((prev) => ({ ...prev, evening: e.target.value }))
              }
              className="min-h-[120px] bg-white border-[#E4BE10] text-[#3B3109] font-mono text-xs"
              placeholder="输入 evening 时段的系统提示词..."
            />
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleResetAll}
            className="border-[#E4BE10] text-[#3B3109] hover:bg-yellow-300/50"
          >
            重置全部
          </Button>
          <div className="flex gap-2 flex-1 sm:flex-initial">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-[#E4BE10] text-[#3B3109] hover:bg-yellow-300/50 flex-1 sm:flex-initial"
            >
              取消
            </Button>
            <Button
              onClick={handleSave}
              className="bg-yellow-400 text-[#3B3109] hover:bg-yellow-300 flex-1 sm:flex-initial"
            >
              保存设置
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
