import { YellowboxEntry } from "@/lib/api/yellowbox";

export interface ExportOptions {
  format: "markdown" | "txt" | "json";
  includeMetadata?: boolean;
  includeTags?: boolean;
  includeTimestamps?: boolean;
}

export function exportSingleEntry(entry: YellowboxEntry, options: ExportOptions): string {
  const { format, includeMetadata = true, includeTags = true, includeTimestamps = true } = options;

  switch (format) {
    case "markdown":
      return exportEntryAsMarkdown(entry, { includeMetadata, includeTags, includeTimestamps });
    case "txt":
      return exportEntryAsText(entry, { includeMetadata, includeTags, includeTimestamps });
    case "json":
      return JSON.stringify(entry, null, 2);
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
}

export function exportMultipleEntries(entries: YellowboxEntry[], options: ExportOptions): string {
  const { format } = options;

  switch (format) {
    case "markdown":
      return entries.map(entry => exportEntryAsMarkdown(entry, options)).join("\n\n---\n\n");
    case "txt":
      return entries.map(entry => exportEntryAsText(entry, options)).join("\n\n" + "=".repeat(50) + "\n\n");
    case "json":
      return JSON.stringify(entries, null, 2);
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
}

function exportEntryAsMarkdown(
  entry: YellowboxEntry, 
  options: { includeMetadata?: boolean; includeTags?: boolean; includeTimestamps?: boolean }
): string {
  const { includeMetadata, includeTags, includeTimestamps } = options;
  let markdown = "";

  // Title
  const title = entry.metadata?.aiSummary || "Untitled Entry";
  markdown += `# ${title}\n\n`;

  // Metadata
  if (includeMetadata && includeTimestamps) {
    const date = new Date(entry.created_at).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
    markdown += `**Date:** ${date}  \n`;
    markdown += `**Time of Day:** ${getTimeOfDayLabel(entry.entries.timeOfDay)}  \n\n`;
  }

  // Tags
  if (includeTags && entry.metadata?.enhancedSummary?.tags && entry.metadata.enhancedSummary.tags.length > 0) {
    const tags = entry.metadata.enhancedSummary.tags.map(tag => `#${tag}`).join(" ");
    markdown += `**Tags:** ${tags}  \n\n`;
  }

  // Emotion
  if (includeMetadata && entry.metadata?.enhancedSummary?.emotion) {
    const emotion = entry.metadata.enhancedSummary.emotion;
    markdown += `**Emotion:** ${emotion.primary} (${emotion.intensity})  \n\n`;
  }

  // Conversation
  markdown += "## Conversation\n\n";
  entry.entries.conversationHistory.forEach((message) => {
    if (message.type === "user") {
      markdown += `**You:** ${message.content}\n\n`;
    } else {
      markdown += `**AI:** ${message.content}\n\n`;
    }
  });

  return markdown;
}

function exportEntryAsText(
  entry: YellowboxEntry, 
  options: { includeMetadata?: boolean; includeTags?: boolean; includeTimestamps?: boolean }
): string {
  const { includeMetadata, includeTags, includeTimestamps } = options;
  let text = "";

  // Title
  const title = entry.metadata?.aiSummary || "Untitled Entry";
  text += `${title}\n${"=".repeat(title.length)}\n\n`;

  // Metadata
  if (includeMetadata && includeTimestamps) {
    const date = new Date(entry.created_at).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
    text += `Date: ${date}\n`;
    text += `Time of Day: ${getTimeOfDayLabel(entry.entries.timeOfDay)}\n\n`;
  }

  // Tags
  if (includeTags && entry.metadata?.enhancedSummary?.tags && entry.metadata.enhancedSummary.tags.length > 0) {
    const tags = entry.metadata.enhancedSummary.tags.map(tag => `#${tag}`).join(" ");
    text += `Tags: ${tags}\n\n`;
  }

  // Emotion
  if (includeMetadata && entry.metadata?.enhancedSummary?.emotion) {
    const emotion = entry.metadata.enhancedSummary.emotion;
    text += `Emotion: ${emotion.primary} (${emotion.intensity})\n\n`;
  }

  // Conversation
  text += "Conversation:\n" + "-".repeat(20) + "\n\n";
  entry.entries.conversationHistory.forEach((message) => {
    if (message.type === "user") {
      text += `You: ${message.content}\n\n`;
    } else {
      text += `AI: ${message.content}\n\n`;
    }
  });

  return text;
}

function getTimeOfDayLabel(timeOfDay: string): string {
  switch (timeOfDay) {
    case "morning": return "Morning";
    case "evening": return "Evening";
    case "daytime": 
    default: return "Daytime";
  }
}

export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function generateFilename(entry: YellowboxEntry, format: string): string {
  const date = new Date(entry.created_at).toISOString().split('T')[0];
  const title = entry.metadata?.aiSummary?.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '_') || 'entry';
  return `yellowbox_${title}_${date}.${format}`;
}

export function generateBatchFilename(entries: YellowboxEntry[], format: string): string {
  const date = new Date().toISOString().split('T')[0];
  const count = entries.length;
  return `yellowbox_entries_${count}_${date}.${format}`;
}