"use client";

import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <div className="py-10 text-center space-y-6">
      <h1 className="text-4xl font-bold tracking-tight">OpenHatch</h1>
      <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
        连接教授与博士申请者的 AI 驱动型开源平台
      </p>
      <div className="flex justify-center gap-4">
        <Button size="lg" variant="default">了解更多</Button>
        <Button size="lg" variant="outline">开源项目</Button>
      </div>
      <div className="mt-8 p-4 bg-muted rounded-lg max-w-3xl mx-auto">
        <p className="text-sm">
          OpenHatch：为教授打造博士人才池，为学生揭示文化资本结构。教授端更智能地招人，更高效地管理学生；
          学生端通过 AI 获取来自&quot;教授视角&quot;的真实建议与评估。系统自动学习教授偏好，将其转化为对学生有帮助的行为引导。
        </p>
      </div>
    </div>
  );
}