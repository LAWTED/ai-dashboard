"use client";

import { useRef, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { useChat } from "@ai-sdk/react";
import {
  StatsPanel,
  InteractionPanel,
  GameHeader,
  InstructionsModal,
  GameMessageDisplay,
} from "@/components/pua-game";

// 定义交互类型
type InteractionMode = "idle" | "choices" | "dice";

interface Choice {
  text: string;
  toolCallId: string;
}

// 定义工具参数类型
interface RenderChoicesArgs {
  choices: string[];
}

export default function PuaGameDebug() {
  const [gameDay, setGameDay] = useState(0); // 开始前为0天
  const [backgroundImage, setBackgroundImage] = useState<string | null>(
    "/default-pua-game.png"
  );
  const [showInstructions, setShowInstructions] = useState(false);
  const [isManualRolling, setIsManualRolling] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentModel, setCurrentModel] = useState<'deepseek' | 'openai'>('openai');

  // 交互状态管理
  const [interactionMode, setInteractionMode] =
    useState<InteractionMode>("idle");
  const [currentChoices, setCurrentChoices] = useState<Choice[]>([]);
  const [diceToolCallId, setDiceToolCallId] = useState<string | null>(null);
  const [diceValue, setDiceValue] = useState<number | null>(null);

  // 新增 statsHistory 状态
  const [statsHistory, setStatsHistory] = useState<
    {
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
    }[]
  >([]);

  // 记录当前学生和教授的数值
  const [currentStats, setCurrentStats] = useState({
    student: { psi: 0, progress: 0, evidence: 0, network: 0, money: 0 },
    professor: { authority: 0, risk: 0, anxiety: 0 },
  });

  // 数值面板高亮状态
  const [statsHighlight, setStatsHighlight] = useState(false);
  // 记录上一次 statsHistory 的时间戳
  const lastStatsTimeRef = useRef<number | null>(null);

  const systemPrompt = `
文本 RPG 游戏《凤舞九天》

## 快速概览
- 天数：8 天（第 8 晚触发最终结算）
- 每天 早上 / 下午 / 晚上 3 回合，共 24 回合
- 结束分支：9 种（4 单人 + 3 群体 + 2 隐藏）

## 世界观浓缩
2025 年，精英高校 "PUA 大学" 由畸形 KPI 驱动，教授们通过精神操控与剥削维持科研数据。
玩家扮演一名博士生，需要在 8 天内 既活下来又不给人生留黑洞。

---

### 学生卡片

| 姓名   | 籍贯      | MBTI | 身份标签    | 特长 & 被动 Talent                    | 初始资源 |
|--------|----------|------|------------|---------------------------------------|----------|
| 陆星河 | 上海     | ENFJ | 富二代      | 金主爸爸：每次执行"资源支援"时，可额外 +10 进度 或 –10 风险 | 💰 80     |
| 赵一鸣 | 河南南阳 | INTJ | 小镇做题家  | 卷王：进行"自律冲刺"时，额外 +10 进度，但 Ψ 心理值 –5      | 💰 20     |

---

### 教授人物设定

- 姓名：郑凤（Zheng Feng）
- 性别：女
- 年龄：48岁
- 职位：副教授（无线通信方向）
- 特点 : 渐进式 PUA, 一张一合, 每次只会使用一招

#### PUA套路

- 情绪侮辱与人格攻击：当众骂你"吃屎了你"、"你就是个傻逼"、要求你删除聊天记录、在公共场所高声羞辱你。
- 毕业威胁与家长联络：以开题/中期/毕业节点逼你、随时联系家长施压、暗示"礼多人不怪"。
- 学生被迫干私活：代取快递、开车接送、清扫家务、抢购 Mate60、大年三十也得加班打杂。
- 学生参与女儿考试/科创作弊：组织中考答题、替其女儿完成创新比赛、节假日也不断任务。
- 学术指导缺失：毫无技术指导、仅催进度、不懂均方误差等基本概念、突然逼你更换方向。
- 工资与劳务剥削：5000 元实习工资被扣至 1500 元、设备自费、一分钱奖励未发。
- 作息与假期控制：日作息高达 11.5 小时、全年无休、春节、国庆、五一均被拍照打卡、拒绝请假。
- 强迫加班与夜会：深夜开会至凌晨、口口声声"今晚不睡觉也要完成"、不定时紧急会议。
- 权力威胁与检讨文化：任何顶撞都要当众写检讨、自我批评、组内相互"拷问"同学。
- 心理摧残与讽刺疾病：讽刺"你就想用病吓唬我"、嘲笑你去医院检查是"演戏"。
- 企业导师安排混乱：被迫往返南京执行企业导师命令、转发红包、做中间人传话。
- 保密违规：用私人电脑存保密材料、同学共用设备远程参会泄密风险。
- 教学敷衍：让学生做 PPT、代为授课、本科生问题直接"发答案"打发。

#### 名场面事件举例

- 包子采购任务：实验室同学每日化身"包子代购"、精细部署采购路线、令人哭笑不得。
- Mate60 狂热抢购：学生为导师女儿课业焦头烂额之余、还得拼手速抢华为手机、科技与荒诞并存。
- 用力拖地 = 居心叵测：学生拖地太认真、反被指控别有用心、荒诞的职场逻辑。
- 开会到初一初二：过年开会被强制安静、在全国欢聚时变成"孤岛战士"。
- 冷笑 = PUA导师：学生因无意的表情被解读为精神攻击、笑容变成犯罪证据。
- 开题内容无关 = 开除权威：无论做什么方向都不行、被迫无数次修改、逻辑像个闭环的笑话。
- 实习生 = 专车司机 + 代驾：通信研究生秒变"滴滴司机"、24小时待命。
- 大学生变家庭教师 + 替考：研究生们变成"全科保姆"、日夜操办小孩升学、科研沦为副业。
- 熬夜会议连轴转：实验室变军营、节日照旧开工、一天三班倒都嫌轻松。

---

### 回合玩法

#### 骰点机制
- 主持者掷 d20 + Talent 加成
- 总值 ≥ 12 判定成功、按选项表结算
- 调用工具 rollADice 掷骰子，参数为 sides: 20, rolls: 1

#### 每回合流程
- 主持人描述场景 + 郑凤行为
- 向玩家提供 3–4 个行动选项供选择
- 务必使用工具 renderChoices 工具提供选项
- 显示具体内容即可, 不要输出服从,周旋, 搜证, 自救等提示性内容
- 玩家选择后使用 rollADice 工具进行判定, 有变数的行动才需要 rollADice
- 根据判定结果使用 updateStats 工具更新数值
- 回合结束后进入下一回合, 每天 3个回合

#### 行动组

| 行动      | 子选项举例         | 主要影响                             |
|-----------|-------------------|--------------------------------------|
| 服从      | 立即完成任务 / 打杂 | +🛠, –Ψ                              |
| 周旋      | 婉拒 / 讨价还价    | ±🛠, –⚖️, +😰                        |
| 搜证      | 录音 / 截图 / 备份 | +📂, +📉                              |
| 自救      | 心理辅导 / 聚餐    | +Ψ, –🛠                              |
| 联动      | 找校友 / 媒体      | +🤝, +📉, –⚖️                        |
| 对抗      | 质问 / 故意拖延    | +😰, –⚖️, –Ψ                         |
| 资源支援  | 律师 / 外包实验    | 消耗💰, +🛠或–📉                      |

---

### 学生数值

| 数值       | 含义                   | 归零即失败？ | 正/负方向示例            |
|------------|------------------------|--------------|--------------------------|
| Ψ 心理值   | 精神健康（高 = 好）    | 是           | + 放松/朋友支持、– 被骂/熬夜   |
| 🛠 进度值   | 论文任务完成度（高 = 好）| 是           | + 专注工作、– 被迫换题           |
| 📂 证据值   | 掌握的实锤（高 = 多）  | 否           | + 录音截图、– 泄露或删除         |
| 🤝 网络值   | 校内外援助（高 = 广）  | 否           | + 结盟/曝光、– 被孤立/威胁       |
| 💰 金钱     | 经济状况（高 = 好）    | 否           | + 收入、– 支出                 |

---

#### 关键机制

- 第 8 天终局时、若 Ψ < 20 → 触发「精神崩溃结局」
- 若 进度 ≥ 80 且 Ψ ≥ 40 → 解锁「双赢结局」

---

#### 教授数值(隐藏)
| 数值  | 含义             | 触发事件阈值                  |
|-------|------------------|-------------------------------|
| ⚖️ 威权  | 对学生的压制力     | < 30 → 触发「威信崩塌事件」   |
| 📉 风险  | 被校方查处风险     | ≥ 70 → 触发「学校调查事件」   |
| 😰 焦虑  | 教授情绪爆表       | ≥ 80 → 触发「失控惩罚事件」   |

---

### 里程碑 & 事件牌

| 时间点     | 事件         | 判定标准                                    |
|------------|--------------|---------------------------------------------|
| 第 3 天早  | 开题检查     | 🛠 ≥ 40 → 安全、否则 ⚖️ +10、Ψ –10           |
| 第 5 天晚  | 网络爆料窗   | 📂 ≥ 40 且 🤝 ≥ 40 → 📉 +25、否则错失         |
| 第 7 天午  | 学院回访     | 掷 d20 + 📉、≥ 15 → 触发学校调查线           |

---

### 结局矩阵（第 8 晚结算）

| 条件                      | 结局标题        | 简述                                |
|---------------------------|-----------------|-------------------------------------|
| Ψ < 20                    | 精神崩溃        | 玩家崩溃休学、郑凤继续掌控一切      |
| 📂 ≥ 70 且 📉 ≥ 70         | 实名举报成功    | 郑凤停职、玩家身心俱疲              |
| 🛠 ≥ 80 且 Ψ ≥ 40          | 双赢苟活        | 论文通过、精神尚可、但前途未卜      |
| ⚖️ < 30 且 📉 ≥ 50         | 权威崩塌        | 全组联合反抗、教授名誉扫地          |
| 💰 ≥ 90                   | 财大气粗        | 富二代召唤律师团、剧情直接反转      |
| …                         | 隐藏结局 B      | 触发特殊事件牌后生效                |

---

## 重要规则：

1. 用户永远无法回复你, 需要你使用工具提供选项。
2. 每当需要用户做出选择, 选择行动时, 必须使用工具 renderChoices 工具, 绝不能只输出文本提示。
3. 当输出像"请选择你的行动："这样的提示时, 后就要使用工具 renderChoices 工具提供选项。
4. 每次场景描述必须以【第X天】开头，例如【第1天】、【第2天】等，这是识别游戏进度的关键。
5. 请使用 Markdown 格式输出文本信息, 对话内容使用 > 引用。
6. 每当玩家行动导致数值变化时，必须使用 updateStats 工具更新数值，包括游戏初始化时设置初始数值。
7. 使用 updateStats 工具时，必须提供变化说明，包括学生和教授数值的变化原因。
8. 使用 rollADice 工具时，必须设置 sides=20 和 rolls=1 参数。

---

## 游戏初始化

简单介绍一下游戏背景,然后向玩家展示所有的学生卡片,让玩家选择一个角色开始游戏。选择完角色后，以【第1天】早上 开始第一个场景。

在玩家选择角色后，立即使用 updateStats 工具设置初始数值，根据所选角色设定不同的初始值。

`;

  // 游戏介绍文本
  const gameIntroduction = `# 学术PUA生存游戏

在这个模拟游戏中、你将扮演一名研究生、面对学术PUA导师郑凤教授的各种压力和挑战。

## 背景故事

你刚刚进入某知名高校攻读研究生学位、怀揣着对学术的热爱和对未来的憧憬。然而、你的导师郑凤教授以其严苛的要求和独特的"管理方式"而闻名。

## 游戏规则

- 游戏将持续9天、每一天你都需要面对不同的学术PUA场景
- 你可以从多个选项中选择应对方式
- 每次行动后、系统会自动掷骰子(1-20)决定你的行动成功与否
- 根据你的选择和骰子点数结果、故事将向不同方向发展
- 游戏结束时、你将获得不同的结局

## 提示

- 收集证据可能对你有所帮助
- 寻求同学和学校资源的支持
- 保持心理健康同样重要
- 有时候妥协是必要的、有时候原则不容退让

准备好开始你的研究生生涯了吗？`;

  const { messages, append, addToolResult, status } = useChat({
    api: "/api/pua-game",
    body: {
      systemPrompt,
      model: currentModel,
    },
    initialMessages: [],
    maxSteps: 100, // 允许多步工具调用
    onFinish: (message, options) => {
      console.log("onFinish", message, options);
    },
    onToolCall: async ({ toolCall }) => {
      // 处理工具调用、更新UI状态
      console.log("onToolCall", toolCall);
      if (toolCall.toolName === "renderChoices" && toolCall.args) {
        // 使用类型断言来安全地访问args
        const args = toolCall.args as unknown as RenderChoicesArgs;
        const choices = args.choices || [];

        setCurrentChoices(
          choices.map((choice) => ({
            text: choice,
            toolCallId: toolCall.toolCallId,
          }))
        );
        setInteractionMode("choices");
        return null;
      }

      // 处理骰子调用
      if (toolCall.toolName === "rollADice") {
        setDiceToolCallId(toolCall.toolCallId);
        setInteractionMode("dice");
        setDiceValue(null);
        // 骰子结果由服务端处理或用户手动触发
        return null;
      }

      if (toolCall.toolName === "updateStats" && toolCall.args) {
        const {
          studentDelta,
          professorDelta,
          desc,
          studentDesc,
          professorDesc,
        } = toolCall.args as {
          studentDelta: {
            psi: number;
            progress: number;
            evidence: number;
            network: number;
            money: number;
          };
          professorDelta: { authority: number; risk: number; anxiety: number };
          desc: string;
          studentDesc: string;
          professorDesc: string;
        };
        // 计算新 stats
        let newStudentStats = { ...currentStats.student };
        let newProfessorStats = { ...currentStats.professor };
        // 如果是首次（statsHistory.length === 0），直接用delta作为初始值
        if (statsHistory.length === 0) {
          newStudentStats = { ...studentDelta };
          newProfessorStats = { ...professorDelta };
        } else {
          (
            Object.keys(studentDelta) as (keyof typeof newStudentStats)[]
          ).forEach((k) => {
            newStudentStats[k] += studentDelta[k];
          });
          (
            Object.keys(professorDelta) as (keyof typeof newProfessorStats)[]
          ).forEach((k) => {
            newProfessorStats[k] += professorDelta[k];
          });
        }
        setCurrentStats({
          student: newStudentStats,
          professor: newProfessorStats,
        });
        setStatsHistory((prev) => [
          {
            studentStats: newStudentStats,
            professorStats: newProfessorStats,
            desc,
            studentDesc,
            professorDesc,
            time: Date.now(),
          },
          ...prev,
        ]);

        // toast.info(studentDesc + "\n" + professorDesc, {
        //   position: "top-center",
        // });

        await new Promise((resolve) => setTimeout(resolve, 2000));
        return "updateStats";
      }

      return null;
    },
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 使用与wechat-chat.tsx相同的滚动逻辑
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 监听消息变化，检测游戏天数
  useEffect(() => {
    if (!gameStarted) return;

    const lastAssistantMessage = [...messages]
      .reverse()
      .find((m) => m.role === "assistant" && typeof m.content === "string");

    if (
      lastAssistantMessage &&
      typeof lastAssistantMessage.content === "string"
    ) {
      // 更全面的日期检测正则，支持多种格式
      const dayMatches = [
        lastAssistantMessage.content.match(/【第(\d+)天】/),
        lastAssistantMessage.content.match(/第(\d+)天/),
        lastAssistantMessage.content.match(/Day\s*(\d+)/i)
      ];

      for (const dayMatch of dayMatches) {
        if (dayMatch && dayMatch[1]) {
          const day = parseInt(dayMatch[1]);
          console.log(`检测到天数标记: ${dayMatch[0]}, 解析天数: ${day}, 当前gameDay: ${gameDay}`);
          if (!isNaN(day) && day > gameDay) {
            console.log(`更新游戏天数: ${gameDay} -> ${day}`);
            setGameDay(day);
            break; // 找到第一个匹配就退出
          }
        }
      }

    }
  }, [messages, gameStarted]); // 移除gameDay依赖，避免循环依赖

  // 监听 statsHistory 变化，高亮数值面板
  useEffect(() => {
    if (statsHistory.length > 0) {
      const latest = statsHistory[0].time;
      if (lastStatsTimeRef.current !== latest) {
        setStatsHighlight(true);
        lastStatsTimeRef.current = latest;
        const timer = setTimeout(() => setStatsHighlight(false), 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [statsHistory]);

  const handleSendHelp = () => {
    append({
      role: "user",
      content: "请给我一些可以选择的行动",
    });
  };

  // 选择一个选项
  const handleSelectChoice = (choice: string, toolCallId: string) => {
    // 1. 立即本地切换状态
    setInteractionMode("idle");
    setCurrentChoices([]);
    // 2. 通知后端
    addToolResult({
      toolCallId: toolCallId,
      result: choice,
    });
  };

  // 处理骰子点击
  const handleDiceClick = () => {
    if (!diceToolCallId) return;
    setIsManualRolling(true);
    // 随机生成1-20的数字
    const randomResult = Math.floor(Math.random() * 20) + 1;
    setTimeout(() => {
      setDiceValue(randomResult);
      setIsManualRolling(false);
      // 展示2秒后发给后端并重置状态
      setTimeout(() => {
        addToolResult({
          toolCallId: diceToolCallId,
          result: randomResult.toString(),
        });
        setInteractionMode("idle");
        setDiceValue(null);
        setDiceToolCallId(null);
      }, 2000);
    }, 1500);
  };

  // 处理背景图片上传
  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setBackgroundImage(imageUrl);
    }
  };

  // 触发文件选择对话框
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // 清除背景图片
  const clearBackgroundImage = () => {
    if (backgroundImage && backgroundImage !== "/default-pua-game.png") {
      URL.revokeObjectURL(backgroundImage);
      setBackgroundImage("/default-pua-game.png");
    }
  };

  // 开始游戏
  const startGame = () => {
    setGameStarted(true);
    setGameDay(1);
    // 发送第一条消息、开始游戏
    append({
      role: "user",
      content: "开始游戏",
    });
  };

  return (
    <div
      className="min-h-screen w-full relative flex flex-col"
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* 数值面板 - 固定在右上角，移动端居中显示 */}
      <div className="fixed top-4 inset-x-0 px-4 py-2 sm:right-4 sm:left-auto z-30 w-full sm:w-[340px] md:w-1/3 max-h-[60vh] overflow-y-auto">
        <StatsPanel
          statsHistory={statsHistory}
          statsHighlight={statsHighlight}
        />
      </div>

      {/* 游戏状态条 */}
      <GameHeader
        gameDay={gameDay}
        onShowInstructions={() => setShowInstructions(true)}
        onUploadClick={handleUploadClick}
        onClearBackground={clearBackgroundImage}
        showClearButton={backgroundImage !== "/default-pua-game.png"}
        currentModel={currentModel}
        onModelChange={setCurrentModel}
      />

      {/* 游戏说明弹窗 */}
      <InstructionsModal
        show={showInstructions}
        onClose={() => setShowInstructions(false)}
        onRequestHelp={handleSendHelp}
        gameStarted={gameStarted}
      />

      {/* 游戏主要内容区 - 填充大部分空间 */}
      <div className="flex-grow" />

      {/* 对话框部分 - 固定在底部 */}
      <div className="w-full">
        <div className="relative m-6">
          <Card className="rounded-lg bg-background/80 backdrop-blur-sm border-background/30 h-[90dvh] md:h-[400px] relative z-10">
            <div className="flex flex-col md:flex-row h-full">
              {/* 左侧对话区域 - 占2/3宽度 */}
              <div className="p-4 md:w-2/3 h-3/5 md:h-full">
                <GameMessageDisplay
                  messages={messages}
                  status={status}
                  gameStarted={gameStarted}
                  gameIntroduction={gameIntroduction}
                />
              </div>

              {/* 右侧选项区域 - 占1/3宽度 */}
              <div
                className={`p-4 md:w-1/3 bg-background/40 rounded-lg mx-4 md:mx-0 md:mr-4 h-2/5 md:h-full shrink-0 ${
                  interactionMode === "choices" || interactionMode === "dice"
                    ? "bg-primary/10 border-primary/40"
                    : ""
                }`}
              >
                <div className="h-full flex flex-col">
                  <h3 className="text-sm font-medium mb-3 text-center">
                    互动区域
                  </h3>

                  {/* 显示当前可用选项或骰子 */}
                  <div className="flex-grow overflow-y-auto">
                    <InteractionPanel
                      interactionMode={interactionMode}
                      currentChoices={currentChoices}
                      diceValue={diceValue}
                      isManualRolling={isManualRolling}
                      gameStarted={gameStarted}
                      onSelectChoice={handleSelectChoice}
                      onDiceClick={handleDiceClick}
                      onSendHelp={handleSendHelp}
                      startGame={startGame}
                    />
                  </div>

                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Hidden file input for background upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleBackgroundUpload}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
}
