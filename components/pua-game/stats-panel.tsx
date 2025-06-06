import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface StatsHistory {
  studentStats: {
    psi: number;
    progress: number;
    evidence: number;
    network: number;
    money: number;
  };
  professorStats: {
    authority: number;
    risk: number;
    anxiety: number;
  };
  desc: string;
  studentDesc: string;
  professorDesc: string;
  time: number;
}

interface StatsProps {
  statsHistory: StatsHistory[];
  statsHighlight: boolean;
}

// Maps for displaying stat labels
const studentStatMap: {
  key: keyof StatsHistory["studentStats"];
  label: string;
}[] = [
  { key: "psi", label: "Ψ 心理值" },
  { key: "progress", label: "🛠 进度值" },
  { key: "evidence", label: "📂 证据值" },
  { key: "network", label: "🤝 网络值" },
  { key: "money", label: "💰 金钱" },
];

const professorStatMap: {
  key: keyof StatsHistory["professorStats"];
  label: string;
}[] = [
  { key: "authority", label: "⚖️ 威权" },
  { key: "risk", label: "📉 风险" },
  { key: "anxiety", label: "😰 焦虑" },
];

export function StatsPanel({ statsHistory, statsHighlight }: StatsProps) {
  if (statsHistory.length === 0) return null;

  return (
    <Card
      className={`mb-2 border-primary/30 transition-colors duration-500 ${
        statsHighlight
          ? "bg-green-100/60 dark:bg-green-900/40 border-green-400"
          : "bg-background/70"
      }`}
    >
      <CardHeader>
        <CardTitle className=" font-semibold">最新数值变化</CardTitle>
      </CardHeader>
      <CardContent>
        <div className=" mb-1">{statsHistory[0].desc}</div>
        <div className="grid grid-cols-2 gap-4 ">
          <div className="min-w-0">
            <span className="font-bold">学生：</span>
            {studentStatMap.map(({ key, label }) => (
              <div key={key} className="mb-2">
                <div className="flex items-center justify-between">
                  <span>{label}</span>
                  <span className="ml-2 font-mono">
                    {statsHistory[0].studentStats[key]}
                  </span>
                </div>
                <Progress
                  value={Math.max(
                    0,
                    Math.min(100, statsHistory[0].studentStats[key])
                  )}
                  className="h-2 mt-1"
                />
              </div>
            ))}
          </div>
          <div className="min-w-0">
            <span className="font-bold">教授：</span>
            {professorStatMap.map(({ key, label }) => (
              <div key={key} className="mb-2">
                <div className="flex items-center justify-between">
                  <span>{label}</span>
                  <span className="ml-2 font-mono">
                    {statsHistory[0].professorStats[key]}
                  </span>
                </div>
                <Progress
                  value={Math.max(
                    0,
                    Math.min(100, statsHistory[0].professorStats[key])
                  )}
                  className="h-2 mt-1"
                />
              </div>
            ))}
          </div>
        </div>
        {statsHistory.length > 1 && (
          <details className="mt-2">
            <summary className="cursor-pointer  text-muted-foreground">
              历史记录
            </summary>
            <div className="mt-1 max-h-32 overflow-y-auto">
              {statsHistory.slice(1).map((item) => (
                <div
                  key={item.time}
                  className="mb-2 border-b pb-1 last:border-b-0"
                >
                  <div className=" mb-1">{item.desc}</div>
                  <div className="grid grid-cols-2 gap-4 ">
                    <div className="min-w-0">
                      <span className="font-bold">学生：</span>
                      {studentStatMap.map(({ key, label }) => (
                        <div key={key} className="mb-2">
                          <div className="flex items-center justify-between">
                            <span>{label}</span>
                            <span className="ml-2 font-mono">
                              {item.studentStats[key]}
                            </span>
                          </div>
                          <Progress
                            value={Math.max(
                              0,
                              Math.min(100, item.studentStats[key])
                            )}
                            className="h-2 mt-1"
                          />
                        </div>
                      ))}
                      {item.studentDesc && (
                        <div className=" text-muted-foreground mt-1">
                          {item.studentDesc}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold">教授：</span>
                      {professorStatMap.map(({ key, label }) => (
                        <div key={key} className="mb-2">
                          <div className="flex items-center justify-between">
                            <span>{label}</span>
                            <span className="ml-2 font-mono">
                              {item.professorStats[key]}
                            </span>
                          </div>
                          <Progress
                            value={Math.max(
                              0,
                              Math.min(100, item.professorStats[key])
                            )}
                            className="h-2 mt-1"
                          />
                        </div>
                      ))}
                      {item.professorDesc && (
                        <div className=" text-muted-foreground mt-1">
                          {item.professorDesc}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </details>
        )}
      </CardContent>
    </Card>
  );
}
