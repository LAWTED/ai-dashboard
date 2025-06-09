import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Drawer } from "vaul";
import { Button } from "@/components/ui/button";
import { BarChart2, TrendingUp, TrendingDown, Minus, ChevronLeft, ChevronRight, User, UserCheck } from "lucide-react";

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

// 柔和色彩映射
const studentStatMap: {
  key: keyof StatsHistory["studentStats"];
  label: string;
  color: string; // label色
  bar: string;   // 进度条色
  icon: string;
}[] = [
  { key: "psi", label: "心理值", color: "text-blue-400", bar: "bg-blue-400", icon: "Ψ" },
  { key: "progress", label: "进度值", color: "text-green-400", bar: "bg-green-400", icon: "🛠" },
  { key: "evidence", label: "证据值", color: "text-purple-400", bar: "bg-purple-400", icon: "📂" },
  { key: "network", label: "网络值", color: "text-orange-400", bar: "bg-orange-400", icon: "🤝" },
  { key: "money", label: "金钱", color: "text-yellow-400", bar: "bg-yellow-400", icon: "💰" },
];

const professorStatMap: {
  key: keyof StatsHistory["professorStats"];
  label: string;
  color: string;
  bar: string;
  icon: string;
}[] = [
  { key: "authority", label: "威权", color: "text-red-400", bar: "bg-red-400", icon: "⚖️" },
  { key: "risk", label: "风险", color: "text-amber-400", bar: "bg-amber-400", icon: "📉" },
  { key: "anxiety", label: "焦虑", color: "text-pink-400", bar: "bg-pink-400", icon: "😰" },
];

// 获取数值变化趋势图标
const getTrendIcon = (current: number, previous?: number) => {
  if (!previous) return <Minus className="h-3 w-3 text-gray-400" />;
  if (current > previous) return <TrendingUp className="h-3 w-3 text-green-500" />;
  if (current < previous) return <TrendingDown className="h-3 w-3 text-red-500" />;
  return <Minus className="h-3 w-3 text-gray-400" />;
};



const StatItem = ({
  label,
  color,
  bar,
  icon,
  value,
  previousValue,
  compact = false
}: {
  label: string;
  color: string;
  bar: string;
  icon: string;
  value: number;
  previousValue?: number;
  compact?: boolean;
}) => (
  <div className={`group hover:bg-muted/30 transition-colors ${compact ? 'p-1 rounded' : 'p-2 rounded-md'}`}>
    <div className={`flex items-center justify-between ${compact ? 'mb-0.5' : 'mb-1'}`}>
      <div className="flex items-center gap-1">
        <span className={compact ? 'text-sm' : 'text-lg'}>{icon}</span>
        <span className={`font-medium ${color} ${compact ? 'text-xs' : 'text-sm'}`}>{label}</span>
        {getTrendIcon(value, previousValue)}
      </div>
      <div className="flex items-center gap-1">
        <span className={`font-mono font-bold ${compact ? 'text-xs' : 'text-sm'}`}>{value}</span>
        {previousValue !== undefined && previousValue !== value && (
          <span className={`text-xs ${value > previousValue ? 'text-green-600' : 'text-red-600'}`}>
            ({value > previousValue ? '+' : ''}{value - previousValue})
          </span>
        )}
      </div>
    </div>
    <div className="relative">
      <div className={`w-full bg-muted rounded-full overflow-hidden ${compact ? 'h-1.5' : 'h-2'}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ${bar}`}
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        />
      </div>
    </div>
  </div>
);

const StatsContent = ({ statsHistory, isMobile = false }: { statsHistory: StatsHistory[]; isMobile?: boolean }) => {
  const current = statsHistory[0];
  const previous = statsHistory[1];
  const [viewMode, setViewMode] = useState<'student' | 'professor'>('student');

  if (isMobile) {
    // 移动端保持完整的垂直布局，无切换功能
    return (
      <div className="space-y-4">
        {/* 整体描述 */}
        <div className="p-3 bg-background/40 backdrop-blur-sm rounded-lg">
          <p className="text-xs font-medium text-muted-foreground mb-1">当前状况</p>
          <p className="text-sm leading-relaxed">{current.desc}</p>
        </div>

        {/* 学生数值 */}
        <div className="bg-background/40 backdrop-blur-sm rounded-lg p-3">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-2 w-2 bg-blue-400 rounded-full"></div>
            <h4 className="font-medium text-blue-400">学生状态</h4>
          </div>
          <div className="space-y-2">
            {studentStatMap.map(({ key, label, color, bar, icon }) => (
              <StatItem
                key={key}
                label={label}
                color={color}
                bar={bar}
                icon={icon}
                value={current.studentStats[key]}
                previousValue={previous?.studentStats[key]}
                compact={false}
              />
            ))}
          </div>
          {current.studentDesc && (
            <div className="text-xs text-muted-foreground bg-blue-50/60 dark:bg-blue-950/20 p-2 rounded mt-2 border-l-2 border-blue-400/30">
              {current.studentDesc}
            </div>
          )}
        </div>

        {/* 教授数值 */}
        <div className="bg-background/40 backdrop-blur-sm rounded-lg p-3">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-2 w-2 bg-red-400 rounded-full"></div>
            <h4 className="font-medium text-red-400">教授状态</h4>
          </div>
          <div className="space-y-2">
            {professorStatMap.map(({ key, label, color, bar, icon }) => (
              <StatItem
                key={key}
                label={label}
                color={color}
                bar={bar}
                icon={icon}
                value={current.professorStats[key]}
                previousValue={previous?.professorStats[key]}
                compact={false}
              />
            ))}
          </div>
          {current.professorDesc && (
            <div className="text-xs text-muted-foreground bg-red-50/60 dark:bg-red-950/20 p-2 rounded mt-2 border-l-2 border-red-400/30">
              {current.professorDesc}
            </div>
          )}
        </div>

        {/* 历史记录 */}
        {statsHistory.length > 1 && (
          <details className="group bg-background/40 backdrop-blur-sm rounded-lg p-3">
            <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 font-medium">
              <span>查看历史记录 ({statsHistory.length - 1} 条)</span>
              <BarChart2 className="h-4 w-4" />
            </summary>
            <div className="mt-3 space-y-2 max-h-40 overflow-y-auto prose prose-sm dark:prose-invert">
              {statsHistory.slice(1).map((item, index) => (
                <div key={item.time} className="bg-muted/20 rounded p-2 border-l-2 border-primary/20">
                  <div className="text-xs text-muted-foreground mb-1 font-mono">
                    记录 #{statsHistory.length - index - 1}
                  </div>
                  <div className="text-sm mb-2 italic">{item.desc}</div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <div className="font-medium text-blue-400 mb-1">学生</div>
                      <div className="space-y-0.5">
                        {studentStatMap.map(({ key, icon, label }) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-muted-foreground">{icon} {label}</span>
                            <span className="font-mono">{item.studentStats[key]}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="font-medium text-red-400 mb-1">教授</div>
                      <div className="space-y-0.5">
                        {professorStatMap.map(({ key, icon, label }) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-muted-foreground">{icon} {label}</span>
                            <span className="font-mono">{item.professorStats[key]}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </details>
        )}
      </div>
    );
  }

  // PC端 - 紧凑的单面板切换设计
  return (
    <div className="space-y-2">
      {/* 整体描述 - 更紧凑 */}
      <div className="p-2 bg-background/40 backdrop-blur-sm rounded">
        <p className="text-xs text-muted-foreground">{current.desc}</p>
      </div>

      {/* 切换面板 */}
      <div className="bg-background/40 backdrop-blur-sm rounded p-2">
        {/* 切换按钮和标题 */}
        <div className="flex items-center justify-between mb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode(viewMode === 'student' ? 'professor' : 'student')}
            className="h-6 px-2 text-xs"
          >
            <ChevronLeft className="h-3 w-3" />
          </Button>

          <div className="flex items-center gap-1">
            {viewMode === 'student' ? (
              <>
                <User className="h-3 w-3 text-blue-400" />
                <span className="text-xs font-medium text-blue-400">学生状态</span>
              </>
            ) : (
              <>
                <UserCheck className="h-3 w-3 text-red-400" />
                <span className="text-xs font-medium text-red-400">教授状态</span>
              </>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode(viewMode === 'student' ? 'professor' : 'student')}
            className="h-6 px-2 text-xs"
          >
            <ChevronRight className="h-3 w-3" />
          </Button>
        </div>

        {/* 数值显示 */}
        <div className="space-y-1">
          {viewMode === 'student' ? (
            studentStatMap.map(({ key, label, color, bar, icon }) => (
              <StatItem
                key={key}
                label={label}
                color={color}
                bar={bar}
                icon={icon}
                value={current.studentStats[key]}
                previousValue={previous?.studentStats[key]}
                compact={true}
              />
            ))
          ) : (
            professorStatMap.map(({ key, label, color, bar, icon }) => (
              <StatItem
                key={key}
                label={label}
                color={color}
                bar={bar}
                icon={icon}
                value={current.professorStats[key]}
                previousValue={previous?.professorStats[key]}
                compact={true}
              />
            ))
          )}
        </div>

        {/* 描述信息 */}
        {((viewMode === 'student' && current.studentDesc) || (viewMode === 'professor' && current.professorDesc)) && (
          <div className={`text-xs text-muted-foreground rounded p-1.5 mt-2 border-l-2 ${
            viewMode === 'student'
              ? 'bg-blue-50/60 dark:bg-blue-950/20 border-blue-400/30'
              : 'bg-red-50/60 dark:bg-red-950/20 border-red-400/30'
          }`}>
            {viewMode === 'student' ? current.studentDesc : current.professorDesc}
          </div>
        )}
      </div>

      {/* 历史记录 - 更紧凑 */}
      {statsHistory.length > 1 && (
        <details className="group bg-background/40 backdrop-blur-sm rounded p-2">
          <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
            <BarChart2 className="h-3 w-3" />
            <span>历史 ({statsHistory.length - 1})</span>
          </summary>
          <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
            {statsHistory.slice(1, 4).map((item) => (
              <div key={item.time} className="bg-muted/20 rounded p-1.5 border-l-2 border-primary/20">
                <div className="text-xs text-muted-foreground italic">{item.desc}</div>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
};

export function StatsPanel({ statsHistory, statsHighlight }: StatsProps) {
  if (statsHistory.length === 0) return null;

  return (
    <>
      {/* Desktop View - 紧凑设计 */}
      <Card
        className={`mb-2 transition-all duration-500 md:block hidden shadow-md bg-background/40 backdrop-blur-sm border-none ${
          statsHighlight
            ? "ring-1 ring-green-200 shadow-green-200/50"
            : ""
        }`}
      >
        <CardHeader className="pb-1">
          <CardTitle className="text-sm font-bold flex items-center gap-1">
            <BarChart2 className="h-3 w-3" />
            状态面板
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <StatsContent statsHistory={statsHistory} isMobile={false} />
        </CardContent>
      </Card>

      {/* Mobile View - 半透明设计 */}
      <div className="md:hidden fixed top-2 right-2 z-50">
        <Drawer.Root>
          <Drawer.Trigger asChild>
            <Button
              size="sm"
              variant="ghost"
              className={`transition-all duration-500 bg-background/40 backdrop-blur-sm text-foreground hover:bg-background/60 ${
                statsHighlight
                  ? "border-2 border-green-400 shadow-green-200/50"
                  : "border-0"
              }`}
            >
              <BarChart2 className="h-4 w-4" />
            </Button>
          </Drawer.Trigger>
          <Drawer.Portal>
            <Drawer.Overlay className="fixed inset-0 bg-black/40 z-[100]" />
            <Drawer.Content className="bg-background/40 backdrop-blur-md flex flex-col rounded-t-[10px] h-[96%] mt-24 fixed bottom-0 left-0 right-0 z-[101]">
              <div className="p-4 bg-transparent rounded-t-[10px] flex-1 overflow-auto">
                <Drawer.Title className="sr-only">游戏状态面板</Drawer.Title>
                <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted mb-6" />
                <div className="max-w-md mx-auto">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-center justify-center">
                    <BarChart2 className="h-5 w-5" />
                    游戏状态面板
                  </h3>
                  <StatsContent statsHistory={statsHistory} isMobile={true} />
                </div>
              </div>
            </Drawer.Content>
          </Drawer.Portal>
        </Drawer.Root>
      </div>
    </>
  );
}
