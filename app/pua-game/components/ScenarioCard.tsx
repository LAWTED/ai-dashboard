"use client";

import { Card } from "@/components/ui/card";

interface ScenarioCardProps {
  title?: string;
  description?: string;
  message?: string;
  showMessage?: boolean;
}

export default function ScenarioCard({
  title,
  description,
  message,
  showMessage
}: ScenarioCardProps) {
  return (
    <Card className="my-4 p-6 shadow-lg">
      {title && (
        <div className="mb-2 text-sm text-gray-500 font-medium">
          {title}
        </div>
      )}

      {description && (
        <p className="text-lg mb-4">{description}</p>
      )}

      {showMessage && message && (
        <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-md mb-4">
          {message}
        </div>
      )}
    </Card>
  );
}