"use client";

import { Button } from "@/components/ui/button";

interface Option {
  id: number;
  text: string;
}

interface OptionsPanelProps {
  options: Option[];
  onSelect: (optionId: number) => void;
}

export default function OptionsPanel({ options, onSelect }: OptionsPanelProps) {
  return (
    <div className="space-y-3">
      {options.map((option) => (
        <Button
          key={option.id}
          variant="outline"
          className="w-full text-left justify-start p-4 h-auto"
          onClick={() => onSelect(option.id)}
        >
          {option.text}
        </Button>
      ))}
    </div>
  );
}