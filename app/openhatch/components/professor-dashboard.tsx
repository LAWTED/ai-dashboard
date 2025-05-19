"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { GraduationCap, Mail, Settings, Users, FileText } from "lucide-react";

export function ProfessorDashboard() {
  const [emailConnected, setEmailConnected] = useState(false);
  const [preferences, setPreferences] = useState("");

  // Mock data for candidates
  const candidates = [
    { id: 1, name: "张三", score: 92, match: "高匹配", background: "人工智能 / 清华大学", email: "zhangsan@example.com" },
    { id: 2, name: "李四", score: 85, match: "中高匹配", background: "计算机科学 / 北京大学", email: "lisi@example.com" },
    { id: 3, name: "王五", score: 78, match: "中匹配", background: "数据科学 / 浙江大学", email: "wangwu@example.com" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">候选人总数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              较上月 +12%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">高匹配候选人</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-muted-foreground">
              较上月 +3
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">邮件处理率</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89%</div>
            <Progress value={89} className="h-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">任务完成率</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">75%</div>
            <Progress value={75} className="h-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Gmail 连接</CardTitle>
            <CardDescription>
              连接您的 Gmail 账户，自动导入并解析简历邮件
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!emailConnected ? (
              <Button onClick={() => setEmailConnected(true)} className="w-full">
                连接 Gmail
              </Button>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>已连接: professor@example.com</span>
                  <Button variant="outline" size="sm">断开</Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  最近同步: 2024年5月15日 14:30
                </p>
                <Button variant="outline" className="w-full">同步邮件</Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>招生偏好设置</CardTitle>
            <CardDescription>
              设置您的招生偏好，AI 将根据这些偏好筛选候选人
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Textarea
                placeholder="例如：我正在寻找具有强大编程背景和机器学习经验的学生，特别是在NLP或计算机视觉领域有研究经历的候选人..."
                value={preferences}
                onChange={(e) => setPreferences(e.target.value)}
                className="min-h-[120px]"
              />
              <Button className="w-full">保存偏好</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>候选人列表</CardTitle>
            <CardDescription>
              根据您的偏好自动评分和排序的候选人
            </CardDescription>
          </div>
          <Button variant="outline" size="sm">
            <Settings className="mr-2 h-4 w-4" />
            筛选
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {candidates.map((candidate) => (
              <div key={candidate.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">{candidate.name}</h3>
                  <p className="text-sm text-muted-foreground">{candidate.background}</p>
                  <p className="text-sm text-muted-foreground">{candidate.email}</p>
                </div>
                <div className="text-right">
                  <div className="font-medium">{candidate.score}分</div>
                  <div className="text-sm text-muted-foreground">{candidate.match}</div>
                  <Button variant="outline" size="sm" className="mt-2">
                    查看详情
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full">查看更多候选人</Button>
        </CardFooter>
      </Card>
    </div>
  );
}