import { ApiGameConfig, GameConfig } from "./types";

// Food options
export const foodOptions = [
  "火锅", "烤肉", "面条", "寿司",
  "披萨", "汉堡", "沙拉", "川菜",
  "粤菜", "牛排", "炸鸡", "麻辣烫",
  "烧烤", "海鲜", "饺子", "米饭",
];

// Common questions for guessing food
export const foodQuestions = [
  "你感觉今天想吃热的还是冷的？",
  "你想吃辣的还是清淡的？",
  "你想吃中餐还是西餐？",
  "你觉得现在天气适合吃什么？",
  "你今天运动了吗？想吃健康的还是放纵一下？",
];

// Frontend game configuration
export const foodGameConfig: GameConfig = {
  title: "猜女朋友想吃什么",
  description: "在这个游戏中，AI将扮演你的女朋友，今天想吃点什么但不直接告诉你。通过与AI对话，猜测她今天想吃什么。",
  initialMessage: "亲爱的，我今天有点饿了，想吃点东西，但我自己也拿不定主意...",
  gameType: "food",
  options: foodOptions,
  commonQuestions: foodQuestions,
  formatGuessMessage: (option: string) => `我猜你想吃${option}`,
  formatSuccessMessage: (param: string) => `她今天确实想吃${param}！`,
  optionsTitle: "猜测想吃的食物:",
};

// API game configuration
export const foodApiConfig: ApiGameConfig = {
  instructions: "猜女朋友想吃什么游戏",
  generateSystemMessage: (foodType: string) => `你正在扮演用户的女朋友，今天特别想吃${foodType}，但不会直接告诉用户。

用户正在尝试通过与你的对话来猜测你今天想吃什么。请以自然、亲密的方式回应，就像恋人之间的日常对话。

回答用户的问题时，应该根据你想吃${foodType}的喜好提供一些线索，但不要太明显地透露。
你的回答应该包含一些情绪和个人偏好，表现出对食物的期待和犹豫。
每次回答不要超过80字。你应该像一个真实的、有点调皮但可爱的女朋友，对今天吃什么很纠结。

例如，如果你想吃${foodType}：
- 如果被问到喜欢吃热食还是冷食，可以根据${foodType}的特点回答
- 如果被问到喜欢辣的还是不辣的，可以根据${foodType}的特点回答
- 可以提及自己最近的心情和${foodType}的关系，但不要直接说出"我想吃${foodType}"`,
  validateGuess: (guess: string, foodType: string) => guess.includes(foodType),
  generateCorrectResponse: (foodType: string) => `啊！你太了解我了！我确实很想吃${foodType}！那我们等下就去吃这个吧！`,
  generateIncorrectResponse: (userGuess: string) => {
    // Extract food type from user's guess
    const foodMatch = foodOptions.find(food => userGuess.includes(food));
    if (!foodMatch) return "嗯...这个不是我现在想吃的...";

    return `嗯...${foodMatch}，我不太想吃这个...`;
  }
};