"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { FileText, GraduationCap, MessageSquare, User } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function StudentDashboard() {
  const [resume, setResume] = useState("");
  const [interests, setInterests] = useState("");

  // Mock data for professor matches
  const professorMatches = [
    {
      id: 1,
      name: "王教授",
      university: "斯坦福大学",
      department: "计算机科学系",
      research: "人工智能、机器学习",
      match: 92,
      feedback: "您的背景与我的研究方向高度匹配，特别是在机器学习方面的项目经验非常有价值。"
    },
    {
      id: 2,
      name: "李教授",
      university: "麻省理工学院",
      department: "电子工程系",
      research: "计算机视觉、深度学习",
      match: 85,
      feedback: "您在计算机视觉方面的经验很好，但建议加强算法基础知识。"
    },
    {
      id: 3,
      name: "张教授",
      university: "加州大学伯克利分校",
      department: "数据科学系",
      research: "自然语言处理、大语言模型",
      match: 78,
      feedback: "您的编程能力很强，但需要更多NLP相关的研究经验。"
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">匹配度</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <Progress value={85} className="h-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">匹配教授</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              新增 +3
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">收到反馈</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">
              本周 +2
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">完成任务</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8/10</div>
            <Progress value={80} className="h-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>个人简历</CardTitle>
            <CardDescription>
              上传您的简历，AI 将分析并匹配适合的教授
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Textarea
                placeholder="粘贴您的简历内容，或描述您的学术背景、研究经历和技能..."
                value={resume}
                onChange={(e) => setResume(e.target.value)}
                className="min-h-[150px]"
              />
              <div className="flex gap-2">
                <Button className="flex-1">上传简历</Button>
                <Button variant="outline" className="flex-1">分析简历</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>研究兴趣</CardTitle>
            <CardDescription>
              描述您的研究兴趣，帮助我们找到最匹配的教授
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Textarea
                placeholder="例如：我对机器学习和自然语言处理特别感兴趣，希望研究大语言模型在医疗领域的应用..."
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                className="min-h-[150px]"
              />
              <Button className="w-full">更新兴趣</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>匹配教授</CardTitle>
          <CardDescription>
            基于您的简历和兴趣，以下是最匹配的教授
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="matches">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="matches">匹配结果</TabsTrigger>
              <TabsTrigger value="feedback">教授反馈</TabsTrigger>
              <TabsTrigger value="tasks">申请任务</TabsTrigger>
            </TabsList>

            <TabsContent value="matches" className="mt-4 space-y-4">
              {professorMatches.map((professor) => (
                <div key={professor.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{professor.name}</h3>
                      <p className="text-sm text-muted-foreground">{professor.university} - {professor.department}</p>
                      <p className="text-sm">研究方向：{professor.research}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{professor.match}% 匹配</div>
                      <Button variant="outline" size="sm" className="mt-2">
                        查看详情
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="feedback" className="mt-4 space-y-4">
              {professorMatches.map((professor) => (
                <div key={professor.id} className="p-4 border rounded-lg">
                  <h3 className="font-medium">{professor.name} 的反馈</h3>
                  <p className="text-sm mt-2">{professor.feedback}</p>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="tasks" className="mt-4">
              <div className="space-y-4">
                <div className="p-4 border rounded-lg flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">准备研究计划书</h3>
                    <p className="text-sm text-muted-foreground">截止日期：2024年6月15日</p>
                  </div>
                  <Button size="sm">开始</Button>
                </div>
                <div className="p-4 border rounded-lg flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">完成编程测试</h3>
                    <p className="text-sm text-muted-foreground">截止日期：2024年6月20日</p>
                  </div>
                  <Button size="sm">开始</Button>
                </div>
                <div className="p-4 border rounded-lg flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">撰写动机信</h3>
                    <p className="text-sm text-muted-foreground">截止日期：2024年6月30日</p>
                  </div>
                  <Button size="sm">开始</Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full">查找更多教授</Button>
        </CardFooter>
      </Card>
    </div>
  );
}