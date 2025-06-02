import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface StatsPanelProps {
  stats: {
    mental: number;
    progress: number;
    evidence: number;
    network: number;
    money: number;
  };
}

export default function StatsPanel({ stats }: StatsPanelProps) {
  return (
    <Card className="p-4 shadow-md">
      <div className="space-y-3">
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium">Ψ 心理值</span>
            <span className="text-sm font-medium">{stats.mental}/100</span>
          </div>
          <Progress value={stats.mental} className="h-2" />
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium">🛠 进度值</span>
            <span className="text-sm font-medium">{stats.progress}/100</span>
          </div>
          <Progress value={stats.progress} className="h-2" />
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium">📂 证据值</span>
            <span className="text-sm font-medium">{stats.evidence}/100</span>
          </div>
          <Progress value={stats.evidence} className="h-2" />
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium">🤝 网络值</span>
            <span className="text-sm font-medium">{stats.network}/100</span>
          </div>
          <Progress value={stats.network} className="h-2" />
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium">💰 金钱</span>
            <span className="text-sm font-medium">{stats.money}/100</span>
          </div>
          <Progress value={stats.money} className="h-2" />
        </div>
      </div>
    </Card>
  );
}