// Game configuration interface
export interface GameConfig {
  title: string;
  description: string;
  initialMessage: string;
  gameType: string;
  options: string[];
  commonQuestions: string[];
  formatGuessMessage: (option: string) => string;
  formatSuccessMessage: (param: string) => string;
  optionsTitle: string;
}

// API game configuration interface
export interface ApiGameConfig {
  instructions: string;
  generateSystemMessage: (gameParam: string) => string;
  validateGuess: (guess: string, gameParam: string) => boolean;
  generateCorrectResponse: (gameParam: string) => string;
  generateIncorrectResponse: (userGuess: string) => string;
}

// For the conversation API
export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}