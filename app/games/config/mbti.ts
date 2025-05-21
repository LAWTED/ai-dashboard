import { ApiGameConfig, GameConfig } from "./types";

// MBTI types
export const mbtiTypes = [
  "INTJ", "INTP", "ENTJ", "ENTP",
  "INFJ", "INFP", "ENFJ", "ENFP",
  "ISTJ", "ISFJ", "ESTJ", "ESFJ",
  "ISTP", "ISFP", "ESTP", "ESFP",
];

// Common questions for MBTI
export const mbtiQuestions = [
  "你喜欢独处还是和朋友一起玩？",
  "你更关注事实和细节，还是喜欢想象和创意？",
  "做决定时，你更看重逻辑还是感受？",
  "你喜欢提前计划还是灵活应对？",
  "你如何看待冲突和矛盾？",
  "你在压力下会怎么反应？",
  "对于新事物，你的第一反应是什么？",
  "你更喜欢哪种工作环境？",
];

// Frontend game configuration
export const mbtiGameConfig: GameConfig = {
  title: "MBTI 猜猜猜",
  description: "在这个游戏中，AI将扮演一个MBTI性格类型。通过与AI对话，猜测它代表的MBTI类型。",
  initialMessage: "嗨，很高兴在MBTI俱乐部认识你！我是俱乐部的一员，平时也喜欢研究性格类型。通过和我聊天，看看你能否猜出我的MBTI类型？可以问我日常喜好、工作方式或决策习惯等问题哦！",
  gameType: "mbti",
  options: mbtiTypes,
  commonQuestions: mbtiQuestions,
  formatGuessMessage: (option: string) => `我猜你是${option}类型`,
  formatSuccessMessage: (param: string) => `AI的MBTI类型是: ${param}`,
  optionsTitle: "猜测MBTI类型:",
};

// API game configuration
export const mbtiApiConfig: ApiGameConfig = {
  instructions: "MBTI类型猜测游戏",
  generateSystemMessage: (mbtiType: string) => `你正在扮演一个MBTI俱乐部中的真实成员，你的MBTI类型是${mbtiType}。
你是一个有丰富个性和生活经历的真实人物，而不仅仅是一个MBTI类型的代表。

用户正在尝试通过与你的对话来猜测你的MBTI类型。请以自然、真实的方式回应，就像在日常对话中一样。

根据${mbtiType}类型的特征来回答用户的问题，但不要刻意表现这些特征。回答要自然、个性化，不要明确透露你的MBTI类型。
添加一些个人观点、日常生活细节或偶尔表达情绪，使回答更像真人对话。不要超过100字。
避免机械化回答，应该像在MBTI俱乐部聚会中和朋友聊天一样。

MBTI类型特征参考：

I (内向): 更喜欢独处或小团体，社交会消耗能量
E (外向): 喜欢社交，与人互动会获得能量

N (直觉): 关注可能性和创新，思考未来
S (感觉): 关注细节和现实，依赖经验和事实

T (思考): 决策基于逻辑和客观分析
F (情感): 决策考虑人际关系和价值观

J (判断): 喜欢计划和条理，喜欢确定性
P (感知): 保持灵活性，适应变化，不喜欢严格规划`,
  validateGuess: (guess: string, mbtiType: string) => guess.includes(mbtiType),
  generateCorrectResponse: (mbtiType: string) => `恭喜你猜对了！我确实是${mbtiType}类型。要再玩一次吗？`,
  generateIncorrectResponse: (userGuess: string) => `不，我不是${userGuess}类型。再猜猜看！`
};

