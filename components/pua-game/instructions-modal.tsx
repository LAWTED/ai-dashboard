import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface InstructionsModalProps {
  show: boolean;
  onClose: () => void;
  onRequestHelp: () => void;
  gameStarted: boolean;
}

export function InstructionsModal({
  show,
  onClose,
  onRequestHelp,
  gameStarted
}: InstructionsModalProps) {
  if (!show) return null;

  return (
    <div className="absolute inset-0 bg-black/60 z-30 flex items-center justify-center p-4">
      <Card className="max-w-md w-full relative">
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-2 top-2"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
        <CardHeader>
          <CardTitle>学术PUA生存游戏 - 游戏说明</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm mb-2">
            在这个游戏中、你是郑凤教授的研究生。她会使用各种PUA手段对你进行学术霸凌。
          </p>
          <p className="text-sm mb-2">
            你可以选择不同的行动来应对、系统会自动掷骰子判断成功与否。
          </p>
          <p className="text-sm">
            游戏将持续5天、每一天的选择都会影响最终结局。
          </p>
          {gameStarted && (
            <Button onClick={onRequestHelp} className="mt-4 w-full">
              请求行动选项
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}