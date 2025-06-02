"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import OptionsPanel from "@/app/pua-game/components/OptionsPanel";
import StatsPanel from "@/app/pua-game/components/StatsPanel";
import ScenarioCard from "@/app/pua-game/components/ScenarioCard";

// Define types for our game
interface Character {
  id: number;
  name: string;
  origin: string;
  mbti: string;
  identity: string;
  talent: string;
  initialMoney: number;
}

interface PuaTactic {
  id: number;
  name: string;
  description: string;
  effects: StatEffects;
}

interface Option {
  id: number;
  text: string;
  action: string;
  effects?: StatEffects;
}

interface StatEffects {
  mental?: number;
  progress?: number;
  evidence?: number;
  network?: number;
  money?: number;
  authority?: number;
  risk?: number;
  anxiety?: number;
}

interface GameStats {
  mental: number;
  progress: number;
  evidence: number;
  network: number;
  money: number;
  authority: number;
  risk: number;
  anxiety: number;
}

interface Scenario {
  title: string;
  description: string;
  effects?: StatEffects;
}

interface MilestoneEvent {
  id: number;
  day: number;
  phase: number;
  name: string;
  description: string;
  check: (stats: GameStats, roll?: number) => boolean;
  success: { description: string; effects?: StatEffects };
  failure: { description: string; effects?: StatEffects };
}

interface Ending {
  id: number;
  name: string;
  condition: (stats: GameStats) => boolean;
  description: string;
}

// Character data
const characters: Character[] = [
  {
    id: 1,
    name: "陆星河",
    origin: "上海",
    mbti: "ENFJ",
    identity: "富二代",
    talent: "金主爸爸：每次执行\"资源支援\"时，可额外 +10 进度 或 –10 风险",
    initialMoney: 80,
  },
  {
    id: 2,
    name: "赵一鸣",
    origin: "河南南阳",
    mbti: "INTJ",
    identity: "小镇做题家",
    talent: "卷王：进行\"自律冲刺\"时，额外 +10 进度，但 Ψ 心理值 –5",
    initialMoney: 20,
  }
];

// PUA tactics from the professor
const puaTactics: PuaTactic[] = [
  {
    id: 1,
    name: "情绪侮辱与人格攻击",
    description: "郑凤当着实验室所有人的面，突然对你喊道：\"你这个废物，吃屎了你！这么简单的任务都做不好！\"",
    effects: { mental: -15, progress: -5, anxiety: 5 },
  },
  {
    id: 2,
    name: "毕业威胁与家长联络",
    description: "郑凤发来消息：\"我看你这样，很难通过下周的开题。我想我应该跟你父母谈谈，毕竟他们交了那么多学费。\"",
    effects: { mental: -10, authority: 10, anxiety: 5 },
  },
  {
    id: 3,
    name: "学生被迫干私活",
    description: "晚上10点，郑凤发来消息：\"明天早上8点去机场接我女儿回来，别迟到。\"",
    effects: { mental: -5, progress: -10, authority: 5 },
  },
  {
    id: 4,
    name: "学生参与女儿考试/科创作弊",
    description: "郑凤把你叫到办公室：\"下周我女儿有初中数学竞赛，你代替她完成，拿一等奖。\"",
    effects: { mental: -10, progress: -15, risk: 15 },
  },
  {
    id: 5,
    name: "学术指导缺失",
    description: "\"你这个实验方案设计得太差劲了！\"郑凤斥责道，但当你请教具体如何改进时，她只回应：\"自己想！\"",
    effects: { mental: -10, progress: -10, authority: 5 },
  },
  {
    id: 6,
    name: "工资与劳务剥削",
    description: "实习补助发放日，郑凤说：\"这个项目经费紧张，你的5000元补助我只能给你1500元，剩下的为实验室做贡献吧。\"",
    effects: { mental: -5, evidence: 10, risk: 10 },
  },
  {
    id: 7,
    name: "作息与假期控制",
    description: "五一假期第一天，郑凤在群里通知：\"假期全员到岗，每天打卡拍照，传到群里。\"",
    effects: { mental: -15, progress: 5, authority: 5 },
  },
  {
    id: 8,
    name: "强迫加班与夜会",
    description: "凌晨1点，郑凤在群里发消息：\"所有人立刻到实验室开会，今晚不做完实验不准睡觉！\"",
    effects: { mental: -20, progress: 10, authority: 10 },
  },
  {
    id: 9,
    name: "权力威胁与检讨文化",
    description: "\"我不满意你的工作态度，明天之前交一份3000字检讨，全组会议上当众念。\"郑凤冷冷地说。",
    effects: { mental: -10, authority: 15, network: -5 },
  },
  {
    id: 10,
    name: "心理摧残与讽刺疾病",
    description: "你因长期熬夜头痛请假去医院，郑凤讽刺道：\"又装病是吧？看看谁比你更会演戏！\"",
    effects: { mental: -20, evidence: 15, risk: 5 },
  },
  {
    id: 11,
    name: "企业导师安排混乱",
    description: "\"明天去南京见企业导师，他有新需求。这边的任务也不能耽误，必须同时完成。\"郑凤命令道。",
    effects: { mental: -10, progress: -5, anxiety: 10 },
  },
  {
    id: 12,
    name: "保密违规",
    description: "郑凤把一份标有\"保密\"字样的政府项目资料发给你：\"用你的私人电脑整理一下，明天要。\"",
    effects: { mental: -5, evidence: 10, risk: 20 },
  }
];

// Action options for each type of scenario
const actionGroups = {
  obey: [
    { text: "立即完成任务", effects: { mental: -5, progress: 15, authority: -5 } },
    { text: "彻夜赶工", effects: { mental: -15, progress: 25, authority: -10 } },
    { text: "默默执行，但做最低限度", effects: { mental: -5, progress: 5, authority: 0 } }
  ],
  negotiate: [
    { text: "委婉表示时间冲突，请求延期", effects: { mental: -5, progress: -5, authority: 5, anxiety: 10 } },
    { text: "提出替代方案", effects: { mental: -5, progress: 0, authority: 0, anxiety: 15 } },
    { text: "假装同意，实际拖延", effects: { mental: -10, progress: -10, authority: 5, anxiety: 20 } }
  ],
  evidence: [
    { text: "录音保存对话", effects: { mental: -5, evidence: 20, risk: 15 } },
    { text: "截图保存聊天记录", effects: { mental: 0, evidence: 15, risk: 10 } },
    { text: "记录详细日志", effects: { mental: 0, evidence: 10, risk: 5 } }
  ],
  selfCare: [
    { text: "找心理咨询师倾诉", effects: { mental: 20, progress: -10, money: -10 } },
    { text: "与朋友聚餐放松", effects: { mental: 15, progress: -5, network: 5, money: -5 } },
    { text: "独自休息一晚", effects: { mental: 10, progress: -5 } }
  ],
  network: [
    { text: "联系学院学生会", effects: { mental: -5, network: 15, risk: 10, authority: -5 } },
    { text: "匿名联系校园媒体", effects: { mental: -5, network: 10, risk: 20, authority: -10 } },
    { text: "找其他导师私下咨询", effects: { mental: -5, network: 10, risk: 5, authority: -5 } }
  ],
  confront: [
    { text: "直接质问不合理要求", effects: { mental: -10, authority: -15, anxiety: 25 } },
    { text: "故意拖延完成任务", effects: { mental: -5, progress: -10, authority: -5, anxiety: 15 } },
    { text: "拒绝执行并表明理由", effects: { mental: -10, authority: -20, anxiety: 30 } }
  ],
  resource: [
    { text: "请律师咨询", effects: { mental: 5, evidence: 10, money: -20, risk: 10 } },
    { text: "外包实验任务", effects: { mental: 10, progress: 20, money: -30 } },
    { text: "购买现成论文资料", effects: { mental: 5, progress: 15, money: -15, risk: 5 } }
  ]
};

// Time system
const dayPhases = ["早晨", "中午", "晚上"];

// Special events
const milestoneEvents: MilestoneEvent[] = [
  {
    id: 1,
    day: 3,
    phase: 0, // 早晨
    name: "开题检查",
    description: "今天是你的开题报告日期，郑凤亲自来检查你的进度。",
    check: (stats: GameStats) => stats.progress >= 40,
    success: { description: "你的进度足够，郑凤看起来很满意。", effects: { mental: 10, authority: -5 } },
    failure: { description: "郑凤对你的进度极为不满，当众羞辱你。", effects: { mental: -10, authority: 10 } }
  },
  {
    id: 2,
    day: 5,
    phase: 2, // 晚上
    name: "网络爆料窗",
    description: "校内匿名论坛出现了揭露导师不当行为的热帖，有人私信询问你是否愿意提供证据。",
    check: (stats: GameStats) => stats.evidence >= 40 && stats.network >= 40,
    success: { description: "你提供的证据引起了广泛关注，学校开始调查此事。", effects: { risk: 25, anxiety: 15 } },
    failure: { description: "你没有足够的证据或人脉支持，错失了这次机会。", effects: {} }
  },
  {
    id: 3,
    day: 7,
    phase: 1, // 中午
    name: "学院回访",
    description: "学院突然通知要对研究生导师情况进行回访调查，询问你对郑凤的评价。",
    check: (stats: GameStats, roll?: number) => (roll || 0) + stats.risk >= 15,
    success: { description: "你的反馈引起了学院重视，决定深入调查郑凤。", effects: { risk: 20, authority: -15, anxiety: 20 } },
    failure: { description: "学院的调查只是走过场，没有实质性结果。", effects: { mental: -5 } }
  }
];

// Ending conditions
const endings: Ending[] = [
  {
    id: 1,
    name: "精神崩溃",
    condition: (stats: GameStats) => stats.mental < 20,
    description: "长期的精神压力让你最终崩溃，你不得不休学接受治疗。郑凤继续她的行为，而你成为了又一个牺牲品。"
  },
  {
    id: 2,
    name: "实名举报成功",
    condition: (stats: GameStats) => stats.evidence >= 70 && stats.risk >= 70,
    description: "凭借充分的证据，你成功实名举报了郑凤。她被停职调查，但这段经历也让你身心疲惫。"
  },
  {
    id: 3,
    name: "双赢苟活",
    condition: (stats: GameStats) => stats.progress >= 80 && stats.mental >= 40,
    description: "你完成了论文并保持了相对健康的心态，但郑凤的阴影仍然笼罩着你的学术生涯。"
  },
  {
    id: 4,
    name: "权威崩塌",
    condition: (stats: GameStats) => stats.authority < 30 && stats.risk >= 50,
    description: "实验室的同学们受你鼓舞，集体反抗郑凤的不合理要求。她的权威彻底崩塌，再也无法控制任何人。"
  },
  {
    id: 5,
    name: "财大气粗",
    condition: (stats: GameStats) => stats.money >= 90,
    description: "你用雄厚的财力请来了顶级律师团队，他们迅速处理了整个事件。郑凤被迫道歉并改变行为，而你全身而退。"
  },
  {
    id: 6,
    name: "集体维权",
    condition: (stats: GameStats) => stats.network >= 80 && stats.evidence >= 50,
    description: "你团结了众多受害学生，集体向学校提交了维权申请。在舆论压力下，学校不得不严肃处理此事。"
  },
  {
    id: 7,
    name: "自我牺牲",
    condition: (stats: GameStats) => stats.mental < 30 && stats.evidence >= 80,
    description: "你以自己的精神健康为代价，收集了足够的证据。虽然郑凤受到了惩罚，但你需要很长时间才能恢复。"
  },
  {
    id: 8,
    name: "隐藏结局：浴火重生",
    condition: (stats: GameStats) => stats.mental >= 80 && stats.progress >= 70 && stats.network >= 60,
    description: "你不仅挺过了郑凤的压迫，还在这个过程中成长为更坚强的人。你的经历激励了更多人勇敢地反抗学术霸凌。"
  },
  {
    id: 9,
    name: "隐藏结局：涅槃凤凰",
    condition: (stats: GameStats) => stats.risk >= 90 && stats.authority < 20 && stats.anxiety >= 90,
    description: "在铁证如山的情况下，郑凤崩溃认错并寻求心理治疗。她痛改前非，成为学术道德的倡导者，而你们的关系也得到了和解。"
  }
];

// Dice roll function
const rollD20 = () => Math.floor(Math.random() * 20) + 1;

// Main game component
export default function PuaGame() {
  // Game state
  const [gamePhase, setGamePhase] = useState("characterSelect"); // characterSelect, gameplay, ending
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);

  // Time tracking
  const [currentDay, setCurrentDay] = useState(1);
  const [currentPhase, setCurrentPhase] = useState(0); // 0: morning, 1: afternoon, 2: evening

  // Player stats
  const [stats, setStats] = useState<GameStats>({
    mental: 50,      // 心理值
    progress: 30,    // 进度值
    evidence: 0,     // 证据值
    network: 10,     // 网络值
    money: 0,        // 金钱

    // Hidden professor stats
    authority: 60,   // 威权
    risk: 10,        // 风险
    anxiety: 20      // 焦虑
  });

  // Current scenario
  const [currentScenario, setCurrentScenario] = useState<Scenario | null>(null);
  const [currentOptions, setCurrentOptions] = useState<Option[]>([]);
  const [isMilestone, setIsMilestone] = useState(false);
  const [milestoneEvent, setMilestoneEvent] = useState<MilestoneEvent | null>(null);

  // Messages
  const [message, setMessage] = useState("");
  const [showMessage, setShowMessage] = useState(false);

  // Initialize character
  const selectCharacter = (character: Character) => {
    setSelectedCharacter(character);
    setStats(prev => ({
      ...prev,
      money: character.initialMoney
    }));
    setGamePhase("gameplay");
    generateScenario();
  };

  // Generate a new scenario
  const generateScenario = () => {
    // Check for milestone events
    const milestone = milestoneEvents.find(
      event => event.day === currentDay && event.phase === currentPhase
    );

    if (milestone) {
      setIsMilestone(true);
      setMilestoneEvent(milestone);
      setCurrentScenario({
        title: milestone.name,
        description: milestone.description
      });

      // Create options based on milestone type
      if (milestone.id === 1) { // 开题检查
        setCurrentOptions([
          { text: "展示你的研究进度", action: "milestone", id: 1 },
          { text: "尝试拖延检查时间", action: "negotiate", id: 2 },
          { text: "熬夜突击准备", action: "obey", id: 3 }
        ]);
      } else if (milestone.id === 2) { // 网络爆料窗
        setCurrentOptions([
          { text: "提供证据支持爆料", action: "milestone", id: 1 },
          { text: "保持沉默", action: "selfCare", id: 2 },
          { text: "警告郑凤有人在爆料", action: "obey", id: 3 }
        ]);
      } else if (milestone.id === 3) { // 学院回访
        setCurrentOptions([
          { text: "如实反映问题", action: "milestone", id: 1 },
          { text: "含糊其辞", action: "negotiate", id: 2 },
          { text: "称赞导师表现", action: "obey", id: 3 }
        ]);
      }
    } else {
      setIsMilestone(false);
      // Random PUA tactic
      const randomTacticIndex = Math.floor(Math.random() * puaTactics.length);
      const tactic = puaTactics[randomTacticIndex];

      setCurrentScenario({
        title: tactic.name,
        description: tactic.description,
        effects: tactic.effects
      });

      // Generate 4 random options from different action groups
      const actionTypes = Object.keys(actionGroups);
      const selectedTypes: string[] = [];

      while (selectedTypes.length < 4 && selectedTypes.length < actionTypes.length) {
        const randomType = actionTypes[Math.floor(Math.random() * actionTypes.length)];
        if (!selectedTypes.includes(randomType)) {
          selectedTypes.push(randomType);
        }
      }

      const options = selectedTypes.map((type, index) => {
        const actionGroup = actionGroups[type as keyof typeof actionGroups];
        const randomOption = actionGroup[Math.floor(Math.random() * actionGroup.length)];
        return {
          text: randomOption.text,
          action: type,
          id: index + 1,
          effects: randomOption.effects
        };
      });

      setCurrentOptions(options);
    }
  };

  // Handle option selection
  const handleOptionSelect = (optionId: number) => {
    const selectedOption = currentOptions.find((option) => option.id === optionId);

    if (selectedOption) {
      // For milestone events
      if (isMilestone && selectedOption.action === "milestone" && milestoneEvent) {
        const success = milestoneEvent.check(stats, rollD20());
        const result = success ? milestoneEvent.success : milestoneEvent.failure;

        setMessage(`${result.description}`);
        setShowMessage(true);

        // Update stats
        if (result.effects) {
          updateStats(result.effects);
        }
      } else {
        // Normal option effects
        if (selectedOption.effects) {
          updateStats(selectedOption.effects);
        }

        // For talent effects
        if (selectedCharacter && selectedCharacter.id === 1 && selectedOption.action === "resource") {
          // 陆星河's talent: 金主爸爸
          updateStats({ progress: 10 });
          setMessage("你的\"金主爸爸\"特长发动，额外获得了+10进度！");
          setShowMessage(true);
        } else if (selectedCharacter && selectedCharacter.id === 2 && selectedOption.action === "obey" && selectedOption.text.includes("赶工")) {
          // 赵一鸣's talent: 卷王
          updateStats({ progress: 10, mental: -5 });
          setMessage("你的\"卷王\"特长发动，额外获得了+10进度，但心理值-5！");
          setShowMessage(true);
        }
      }

      // Advance time after handling message
      setTimeout(() => {
        setShowMessage(false);
        advanceTime();
      }, 2000);
    }
  };

  // Update game stats with limits
  const updateStats = (effects: StatEffects) => {
    setStats(prev => ({
      mental: Math.max(0, Math.min(100, prev.mental + (effects.mental || 0))),
      progress: Math.max(0, Math.min(100, prev.progress + (effects.progress || 0))),
      evidence: Math.max(0, Math.min(100, prev.evidence + (effects.evidence || 0))),
      network: Math.max(0, Math.min(100, prev.network + (effects.network || 0))),
      money: Math.max(0, Math.min(100, prev.money + (effects.money || 0))),

      // Hidden stats
      authority: Math.max(0, Math.min(100, prev.authority + (effects.authority || 0))),
      risk: Math.max(0, Math.min(100, prev.risk + (effects.risk || 0))),
      anxiety: Math.max(0, Math.min(100, prev.anxiety + (effects.anxiety || 0)))
    }));
  };

  // Advance time to next phase
  const advanceTime = () => {
    if (currentPhase < 2) {
      // Next phase of the same day
      setCurrentPhase(currentPhase + 1);
    } else {
      // Next day
      setCurrentPhase(0);
      setCurrentDay(currentDay + 1);
    }
  };

  // Check for game ending
  useEffect(() => {
    // Last phase of the last day - trigger ending
    if (currentDay > 8 || (currentDay === 8 && currentPhase === 2)) {
      const triggeredEnding = endings.find(ending => ending.condition(stats));

      if (triggeredEnding) {
        setGamePhase("ending");
        setCurrentScenario({
          title: triggeredEnding.name,
          description: triggeredEnding.description
        });
      } else {
        // Default ending if no condition met
        setGamePhase("ending");
        setCurrentScenario({
          title: "学术生涯继续",
          description: "你勉强度过了这段艰难时期，但前途依然充满不确定性。郑凤仍然是你的导师，你需要继续在她的管控下完成学业。"
        });
      }
    } else if (gamePhase === "gameplay") {
      generateScenario();
    }
  }, [currentDay, currentPhase, gamePhase]);

  // Character selection screen
  if (gamePhase === "characterSelect") {
    return (
      <div className="flex flex-col min-h-screen p-4 max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center">凤舞九天 - 学术PUA生存游戏</h1>
        <p className="mb-6 text-center">选择你的角色开始游戏</p>

        <div className="space-y-4">
          {characters.map(character => (
            <Card
              key={character.id}
              className="p-4 cursor-pointer hover:bg-gray-100"
              onClick={() => selectCharacter(character)}
            >
              <h2 className="text-xl font-bold">{character.name}</h2>
              <div className="text-sm text-gray-600">
                <p>籍贯: {character.origin}</p>
                <p>MBTI: {character.mbti}</p>
                <p>身份: {character.identity}</p>
                <p className="mt-2 font-medium">特长: {character.talent}</p>
                <p className="mt-1">初始资金: 💰 {character.initialMoney}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Ending screen
  if (gamePhase === "ending") {
    return (
      <div className="flex flex-col min-h-screen p-4 max-w-md mx-auto">
        <StatsPanel
          stats={{
            mental: stats.mental,
            progress: stats.progress,
            evidence: stats.evidence,
            network: stats.network,
            money: stats.money
          }}
        />

        <Card className="my-6 p-6 text-center">
          <h2 className="text-xl font-bold mb-4">游戏结束 - {currentScenario.title}</h2>
          <p className="mb-6">{currentScenario.description}</p>

          <div className="space-y-2 mb-6">
            <p>Ψ 心理值: {stats.mental}/100</p>
            <p>🛠 进度值: {stats.progress}/100</p>
            <p>📂 证据值: {stats.evidence}/100</p>
            <p>🤝 网络值: {stats.network}/100</p>
            <p>💰 金钱: {stats.money}/100</p>
          </div>

          <button
            className="px-4 py-2 bg-primary text-white rounded-md"
            onClick={() => {
              setGamePhase("characterSelect");
              setCurrentDay(1);
              setCurrentPhase(0);
              setStats({
                mental: 50,
                progress: 30,
                evidence: 0,
                network: 10,
                money: 0,
                authority: 60,
                risk: 10,
                anxiety: 20
              });
            }}
          >
            重新开始
          </button>
        </Card>
      </div>
    );
  }

  // Main gameplay
  return (
    <div className="flex flex-col min-h-screen p-4 max-w-md mx-auto">
      {/* Top: Day Info & Stats */}
      <div className="flex justify-between items-center mb-2">
        <div className="text-sm font-medium">
          第 {currentDay} 天 · {dayPhases[currentPhase]}
        </div>
        <div className="text-sm font-medium">
          {selectedCharacter?.name}
        </div>
      </div>

      <StatsPanel
        stats={{
          mental: stats.mental,
          progress: stats.progress,
          evidence: stats.evidence,
          network: stats.network,
          money: stats.money
        }}
      />

      {/* Scenario Card */}
      <ScenarioCard
        title={currentScenario?.title}
        description={currentScenario?.description}
        message={message}
        showMessage={showMessage}
      />

      {/* Options */}
      <OptionsPanel
        options={currentOptions.map(opt => ({ id: opt.id, text: opt.text }))}
        onSelect={handleOptionSelect}
      />
    </div>
  );
}