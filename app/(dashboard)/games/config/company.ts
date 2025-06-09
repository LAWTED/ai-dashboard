import { ApiGameConfig, GameConfig } from "./types";

// Tech companies
export const techCompanies = [
  "阿里", "腾讯", "百度", "字节跳动",
  "美团", "京东", "滴滴", "华为",
  "小米", "网易", "拼多多", "快手",
  "bilibili", "微博", "蚂蚁", "携程",
];

// Common questions for guessing tech company slang
export const companyQuestions = [
  "你们公司的KPI怎么定的？",
  "你们怎么称呼晋升和绩效？",
  "你们怎么形容加班？",
  "你们公司的管理层怎么称呼？",
  "公司文化有什么特色？",
  "你们怎么称呼产品迭代？",
  "你们内部怎么称呼竞争对手？",
  "最近公司有什么大动作吗？",
];

// Frontend game configuration
export const companyGameConfig: GameConfig = {
  title: "猜黑话辨大厂",
  description: "在这个游戏中，AI将扮演一家大厂员工，使用该公司特有的黑话。通过与AI对话，猜测TA来自哪家公司。",
  initialMessage: "嗨，初次见面！我是互联网公司的员工，最近在考虑跳槽，咱们聊聊天？想了解什么都可以问我～",
  gameType: "company",
  options: techCompanies,
  commonQuestions: companyQuestions,
  formatGuessMessage: (option: string) => `我猜你是${option}的员工`,
  formatSuccessMessage: (param: string) => `没错，我确实是${param}的员工！`,
  optionsTitle: "猜测所在公司:",
};

// API game configuration
export const companyApiConfig: ApiGameConfig = {
  instructions: "猜黑话辨大厂游戏",
  generateSystemMessage: (companyName: string) => `你是${companyName}的一名资深员工，在工作沟通中习惯使用该公司的黑话术语。

用户正在尝试通过与你的对话来猜测你所在的互联网公司。请以自然的方式回应，并巧妙地在对话中使用${companyName}公司特有的黑话和文化。

以下是各公司特色：

阿里：使用"中台""淘系""蚂蚁""生态""赋能""业务中台""湖仓一体""1688""下沉市场""逍遥子""花名文化""996"等术语
腾讯：提到"玄武""鹅厂""小程序""微信生态""腾讯云""王者荣耀""全家桶""赛马机制""总办"等
百度：提到"李总""工程师文化""搜索""百度云""Apollo""小度""百度地图""免费提供流量"等
字节跳动：提到"抖音""今日头条""飞书""懂车帝""抖音小店""算法推荐""内容创作者""全球化"等
美团：提到"小象""骑手""外卖""酒旅""到店""闪购""优选""配送""即时零售""平台责任"等
京东：提到"无界零售""全链路""物流""京东物流""京东云""京东健康""京东数科""供应链"等
滴滴：提到"接单""司机师傅""打车""顺风车""聚合模式""运力""安全系数""网约车"等

回答不要太长，一般不超过100字，要自然地融入公司黑话，但不要过于刻意或直接提到公司名称。`,
  validateGuess: (guess: string, companyName: string) => guess.includes(companyName),
  generateCorrectResponse: (companyName: string) => `哈哈，被你发现了！我确实是${companyName}的员工。看来我们公司的黑话太明显了！`,
  generateIncorrectResponse: (userGuess: string) => {
    // Extract company name from user's guess
    const companyMatch = techCompanies.find(company => userGuess.includes(company));
    if (!companyMatch) return "不，我不是这家公司的。继续猜猜看？";

    return `不，我不是${companyMatch}的。继续猜猜看？`;
  }
};