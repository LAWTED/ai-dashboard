import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Upload, Info } from "lucide-react";

interface GameHeaderProps {
  gameDay: number;
  onShowInstructions: () => void;
  onUploadClick: () => void;
  onClearBackground: () => void;
  showClearButton: boolean;
}

export function GameHeader({
  gameDay,
  onShowInstructions,
  onUploadClick,
  onClearBackground,
  showClearButton
}: GameHeaderProps) {
  return (
    <div className="absolute top-0 left-0 right-0 p-2 z-20 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <Badge
          variant="outline"
          className="bg-black/40 text-white flex items-center gap-1 px-3 py-1 text-sm"
        >
          <Calendar className="h-4 w-4" />
          <span>第{gameDay}/9天</span>
        </Badge>
        <Button
          size="sm"
          variant="ghost"
          className="bg-black/40 text-white hover:bg-black/60"
          onClick={onShowInstructions}
        >
          <Info className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="bg-black/40 text-white hover:bg-black/60 flex items-center gap-1"
          onClick={onUploadClick}
        >
          <Upload className="h-4 w-4" />
          <span className="text-xs">背景图片</span>
        </Button>

        {showClearButton && (
          <Button
            variant="ghost"
            size="sm"
            className="bg-black/40 text-white hover:bg-black/60"
            onClick={onClearBackground}
          >
            清除背景
          </Button>
        )}
      </div>
    </div>
  );
}