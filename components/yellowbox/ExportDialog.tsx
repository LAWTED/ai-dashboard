"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, FileText, File, Code } from "lucide-react";
import { YellowboxEntry } from "@/lib/api/yellowbox";
import {
  exportSingleEntry,
  exportMultipleEntries,
  downloadFile,
  generateFilename,
  generateBatchFilename,
  type ExportOptions
} from "@/lib/utils/export";
import { toast } from "sonner";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entries: YellowboxEntry[];
  selectedEntries?: YellowboxEntry[];
  mode?: "single" | "multiple";
}

export function ExportDialog({
  open,
  onOpenChange,
  entries,
  selectedEntries,
  mode = "multiple"
}: ExportDialogProps) {
  const [format, setFormat] = useState<"markdown" | "txt" | "json">("markdown");
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [includeTags, setIncludeTags] = useState(true);
  const [includeTimestamps, setIncludeTimestamps] = useState(true);

  const exportEntries = selectedEntries && selectedEntries.length > 0 ? selectedEntries : entries;

  const handleExport = () => {
    try {
      const options: ExportOptions = {
        format,
        includeMetadata,
        includeTags,
        includeTimestamps
      };

      let content: string;
      let filename: string;
      let mimeType: string;

      if (mode === "single" && exportEntries.length === 1) {
        content = exportSingleEntry(exportEntries[0], options);
        filename = generateFilename(exportEntries[0], format);
      } else {
        content = exportMultipleEntries(exportEntries, options);
        filename = generateBatchFilename(exportEntries, format);
      }

      switch (format) {
        case "markdown":
          mimeType = "text/markdown";
          break;
        case "txt":
          mimeType = "text/plain";
          break;
        case "json":
          mimeType = "application/json";
          break;
        default:
          mimeType = "text/plain";
      }

      downloadFile(content, filename, mimeType);
      
      const entryCount = exportEntries.length;
      toast.success(`Exported ${entryCount} ${entryCount === 1 ? 'entry' : 'entries'} as ${format.toUpperCase()}`);
      
      onOpenChange(false);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export entries");
    }
  };

  const formatOptions = [
    {
      value: "markdown" as const,
      label: "Markdown",
      description: "Rich text format with formatting",
      icon: FileText,
      extension: ".md"
    },
    {
      value: "txt" as const,
      label: "Plain Text",
      description: "Simple text format",
      icon: File,
      extension: ".txt"
    },
    {
      value: "json" as const,
      label: "JSON",
      description: "Structured data format",
      icon: Code,
      extension: ".json"
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Entries
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Export info */}
          <div className="text-sm text-gray-600">
            Exporting {exportEntries.length} {exportEntries.length === 1 ? 'entry' : 'entries'}
          </div>

          {/* Format selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Format</label>
            <div className="space-y-2">
              {formatOptions.map((option) => (
                <Card
                  key={option.value}
                  className={`p-3 cursor-pointer transition-colors ${
                    format === option.value
                      ? "border-yellow-400 bg-yellow-50"
                      : "border-gray-200 hover:border-yellow-300"
                  }`}
                  onClick={() => setFormat(option.value)}
                >
                  <div className="flex items-center gap-3">
                    <option.icon className="w-4 h-4 text-gray-600" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{option.label}</span>
                        <span className="text-xs text-gray-500">{option.extension}</span>
                      </div>
                      <div className="text-xs text-gray-600">{option.description}</div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      format === option.value
                        ? "border-yellow-400 bg-yellow-400"
                        : "border-gray-300"
                    }`} />
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Include</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={includeMetadata}
                  onChange={(e) => setIncludeMetadata(e.target.checked)}
                  className="rounded"
                />
                Metadata (emotions, themes)
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={includeTags}
                  onChange={(e) => setIncludeTags(e.target.checked)}
                  className="rounded"
                />
                Tags
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={includeTimestamps}
                  onChange={(e) => setIncludeTimestamps(e.target.checked)}
                  className="rounded"
                />
                Timestamps
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleExport}
              className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black"
            >
              Export
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}