import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProfessorStore } from "@/lib/store/professorStore";
import { useRef, useEffect } from "react";

export default function LogsPanel() {
  const { logs, clearLogs } = useProfessorStore();
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Format date time for logs
  const formatDateTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  // Scroll logs to bottom when they change
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>System Logs</CardTitle>
          <Button variant="outline" size="sm" onClick={clearLogs}>
            Clear Logs
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <div className="h-full flex flex-col">
          <div className="flex-1 overflow-y-auto p-3 bg-black/90 text-gray-200 font-mono text-xs rounded-b-lg">
            {logs.map((log, index) => {
              // Parse ANSI color codes
              let content = log.message;

              // Define color classes based on log level or color
              let textColorClass = "";
              if (log.color === "red") textColorClass = "text-red-400";
              else if (log.color === "green")
                textColorClass = "text-green-400";
              else if (log.color === "yellow")
                textColorClass = "text-yellow-400";
              else if (log.color === "blue")
                textColorClass = "text-blue-400";
              else if (log.color === "magenta")
                textColorClass = "text-fuchsia-400";
              else if (log.color === "cyan")
                textColorClass = "text-cyan-400";
              else if (log.level === "error")
                textColorClass = "text-red-400";
              else if (log.level === "warning")
                textColorClass = "text-yellow-400";
              else if (log.level === "debug")
                textColorClass = "text-blue-400";
              else textColorClass = "text-gray-300";

              // Remove ANSI color codes for display
              content = content.replace(/\u001b\[\d+m/g, "");

              return (
                <div
                  key={index}
                  className="mb-1 py-1 border-b border-gray-800"
                >
                  <span className="text-gray-500">
                    [{formatDateTime(log.timestamp)}]
                  </span>{" "}
                  <span className={textColorClass}>{content}</span>
                </div>
              );
            })}
            <div ref={logsEndRef} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}