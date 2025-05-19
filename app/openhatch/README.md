# OpenHatch Demo

这是 OpenHatch 项目的演示版本，展示了一个连接教授与博士申请者的 AI 驱动型开源平台。

## 功能概述

### 教授端
- Gmail 授权接入 → 自动导入并解析简历邮件
- 预设偏好 Prompt → 简历匹配打分系统
- 招生任务板 → AI 帮助拆解任务、匹配适合学生
- AI 助手 → 24/7 追踪学生进度、答疑、辅导 onboarding

### 学生端
- AI Bot 初步筛选，定位目标项目和教授
- 接收基于教授偏好的个性化建议（如 SOP 改写提示）
- 一步步完成教授预设的 trail（如作品、问卷、动机）
- 可视化展示与"教授视角候选人"之间的差距

## 技术栈

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- AI SDK

## 开发指南

1. 克隆仓库
2. 安装依赖: `npm install`
3. 运行开发服务器: `npm run dev`
4. 在浏览器中访问: `http://localhost:3000/openhatch`

## 项目愿景

OpenHatch 旨在解决博士申请过程中的信息不对称问题，通过 AI 技术连接教授和学生，提高匹配效率。我们相信，真正的文化资本藏在教授的决策过程里，一旦把这些规则结构化，就能大幅提升匹配效率。