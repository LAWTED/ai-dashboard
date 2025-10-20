'use client';

import { useState, useEffect } from 'react';

export type Language = 'zh' | 'en';

export interface YellowboxTranslations {
  // Common
  loading: string;
  logout: string;

  // Yellowbox specific
  title: string;
  titlePart1: string;
  titlePart2: string;
  titlePart3: string;
  newEntry: string;
  placeholder: string;
  sparkButton: string;
  doneButton: string;
  thinking: string;
  newEntryButton: string;

  // Questions
  questions: string[];

  // Auth
  email: string;
  password: string;
  signUpButton: string;
  signInButton: string;
  signingIn: string;
  emailPlaceholder: string;
  passwordPlaceholder: string;
  noAccount: string;
  hasAccount: string;
  loginSuccess: string;
  checkEmail: string;
  anErrorOccurred: string;
  access: string;
  login: string;
  
  // Password reset
  forgotPassword: string;
  resetPassword: string;
  sendResetEmail: string;
  sending: string;
  passwordResetSent: string;
  backToSignIn: string;
  emailRequired: string;

  // Errors and messages
  somethingWentWrong: string;
  logoutSuccess: string;
  loginError: string;
  entriesSaved: string;
  saveError: string;

  // Summary related
  generatingSummary: string;
  summaryError: string;

  // Time of day titles
  morningReflection: string;
  eveningReflection: string;

  // Language switching
  switchLanguage: string;

  // Entries pages
  myEntries: string;
  noEntries: string;
  backToWrite: string;
  backToEntries: string;
  entryDetail: string;
  loadingEntries: string;
  loadingEntry: string;
  errorLoadingEntries: string;
  errorLoadingEntry: string;
  entryNotFound: string;
  createdAt: string;
  conversation: string;
  messages: string;


  // Stats
  writingStats: string;
  thisWeek: string;
  totalWords: string;
  writingStreak: string;
  uniqueValues: string;
  entries: string;
  entry: string;
  minRead: string;
  day: string;
  days: string;
  inARow: string;
  uniqueValue: string;
  discovered: string;
  discoveringPatterns: string;
  chars: string;
  words: string;

  // Voice input
  recordingStarted: string;
  recordingCompleted: string;
  recordingFailed: string;
  recordingTooLarge: string;
  microphoneAccessDenied: string;

  // Loading stages
  reading: string;
  uploading: string;
  responding: string;

  // Entry management
  confirmDelete: string;
  designQuote: string;
  deleteEntry: string;
  deleting: string;
  delete: string;
  export: string;
  searchEntries: string;
  noMatchingEntries: string;
  clearSearch: string;
  daytime: string;
  clearAll: string;
  showingAll: string;
  showingFiltered: string;
  more: string;
  untitledEntry: string;
}

export const yellowboxTranslations: Record<Language, YellowboxTranslations> = {
  zh: {
    // Common
    loading: '加载中...',
    logout: '退出',

    // Yellowbox specific
    title: '你在想什么？',
    titlePart1: '你在想',
    titlePart2: '什么',
    titlePart3: '？',
    newEntry: '新条目',
    placeholder: '写点什么...',
    sparkButton: '启发',
    doneButton: '完成',
    thinking: '思考中...',
    newEntryButton: '新条目',

    // Questions
    questions: [
      '今天有什么小小的成功或大大的胜利吗？',
      '今天发生了什么积极的事情？',
      '今天的亮点是什么？'
    ],

    // Auth
    email: '邮箱',
    password: '密码',
    signUpButton: '注册',
    signInButton: '登录',
    signingIn: '登录中...',
    emailPlaceholder: '你的邮箱@email.com',
    passwordPlaceholder: '••••••••',
    noAccount: '没有账号？立即注册',
    hasAccount: '已有账号？立即登录',
    loginSuccess: '登录成功',
    checkEmail: '请查看您的邮箱以获取确认链接',
    anErrorOccurred: '发生错误',
    access: '访问',
    login: '登录',
    
    // Password reset
    forgotPassword: '忘记密码？',
    resetPassword: '重置密码',
    sendResetEmail: '发送重置邮件',
    sending: '发送中...',
    passwordResetSent: '重置密码邮件已发送！',
    backToSignIn: '返回登录',
    emailRequired: '请输入邮箱地址',

    // Errors and messages
    somethingWentWrong: '出了点问题，请重试。',
    logoutSuccess: '已成功退出',
    loginError: '登录错误',
    entriesSaved: '条目已保存成功！',
    saveError: '保存条目失败',

    // Summary related
    generatingSummary: '生成摘要中...',
    summaryError: '生成摘要失败',

    // Time of day titles
    morningReflection: '晨间反思',
    eveningReflection: '夜间反思',

    // Language switching
    switchLanguage: 'Switch to English',

    // Entries pages
    myEntries: '我的笔记',
    noEntries: '还没有笔记条目',
    backToWrite: 'Write...',
    backToEntries: '我的笔记',
    entryDetail: '笔记详情',
    loadingEntries: '加载中...',
    loadingEntry: '加载中...',
    errorLoadingEntries: '加载笔记失败',
    errorLoadingEntry: '加载笔记详情失败',
    entryNotFound: '找不到该笔记',
    createdAt: '创建时间',
    conversation: '对话记录',
    messages: '条消息',


    // Stats
    writingStats: '写作统计',
    thisWeek: '本周',
    totalWords: '总字数',
    writingStreak: '写作连续',
    uniqueValues: '价值观',
    entries: '条目',
    entry: '条目',
    minRead: '分钟阅读',
    day: '天',
    days: '天',
    inARow: '连续',
    uniqueValue: '个价值观',
    discovered: '已发现',
    discoveringPatterns: '探索模式中',
    chars: '字符',
    words: '词',

    // Voice input
    recordingStarted: '录音开始，点击停止按钮结束录音',
    recordingCompleted: '语音识别完成',
    recordingFailed: '语音识别失败，请重试',
    recordingTooLarge: '录音文件过大，请重新录制较短的音频',
    microphoneAccessDenied: '无法访问麦克风，请检查权限设置',

    // Loading stages
    reading: '阅读中...',
    uploading: '上传图片中...',
    responding: '回应中...',

    // Entry management
    confirmDelete: '确定要删除这个条目吗？此操作无法撤销。',
    designQuote: '设计精彩瞬间',
    deleteEntry: '删除条目',
    deleting: '删除中...',
    delete: '删除',
    export: '导出',
    searchEntries: '搜索条目内容...',
    noMatchingEntries: '没有找到符合条件的条目',
    clearSearch: '清除搜索',
    daytime: '日间',
    clearAll: '清除全部',
    showingAll: '显示全部',
    showingFiltered: '显示',
    more: '更多',
    untitledEntry: '无标题条目'
  },

  en: {
    // Common
    loading: 'Loading...',
    logout: 'Logout',

    // Yellowbox specific
    title: "What's on your mind?",
    titlePart1: "What's on ",
    titlePart2: "your",
    titlePart3: " mind?",
    newEntry: 'New entry',
    placeholder: 'Write...',
    sparkButton: 'Spark',
    doneButton: 'Done',
    thinking: 'Thinking...',
    newEntryButton: 'New Entry',

    // Questions
    questions: [
      "What's one win, small or big, you had today?",
      "What's one positive thing that happened today?",
      "What was the highlight of your day?"
    ],

    // Auth
    email: 'Email',
    password: 'Password',
    signUpButton: 'Sign Up',
    signInButton: 'Sign In',
    signingIn: 'Signing in...',
    emailPlaceholder: 'your@email.com',
    passwordPlaceholder: '••••••••',
    noAccount: "Don't have an account? Sign up",
    hasAccount: 'Already have an account? Sign in',
    loginSuccess: 'Login successful',
    checkEmail: 'Check your email for the confirmation link',
    anErrorOccurred: 'An error occurred',
    access: 'Access',
    login: 'Login',
    
    // Password reset
    forgotPassword: 'Forgot password?',
    resetPassword: 'Reset Password',
    sendResetEmail: 'Send Reset Email',
    sending: 'Sending...',
    passwordResetSent: 'Password reset email sent!',
    backToSignIn: 'Back to sign in',
    emailRequired: 'Email is required',

    // Errors and messages
    somethingWentWrong: 'Something went wrong. Please try again.',
    logoutSuccess: 'Logged out successfully',
    loginError: 'Login error',
    entriesSaved: 'Entries saved successfully!',
    saveError: 'Failed to save entries',

    // Summary related
    generatingSummary: 'Generating summary...',
    summaryError: 'Failed to generate summary',

    // Time of day titles
    morningReflection: 'Morning Reflection',
    eveningReflection: 'Evening Reflection',

    // Language switching
    switchLanguage: '切换到中文',

    // Entries pages
    myEntries: 'My Entries',
    noEntries: 'No entries yet',
    backToWrite: 'Write...',
    backToEntries: 'My Entries',
    entryDetail: 'Entry Detail',
    loadingEntries: 'Loading...',
    loadingEntry: 'Loading...',
    errorLoadingEntries: 'Failed to load entries',
    errorLoadingEntry: 'Failed to load entry',
    entryNotFound: 'Entry not found',
    createdAt: 'Created at',
    conversation: 'Conversation',
    messages: 'messages',


    // Stats
    writingStats: 'Writing Stats',
    thisWeek: 'This Week',
    totalWords: 'Total Words',
    writingStreak: 'Writing Streak',
    uniqueValues: 'Unique Values',
    entries: 'entries',
    entry: 'entry',
    minRead: 'min read',
    day: 'day',
    days: 'days',
    inARow: 'in a row',
    uniqueValue: 'unique value',
    discovered: 'discovered',
    discoveringPatterns: 'Discovering patterns',
    chars: 'chars',
    words: 'words',

    // Voice input
    recordingStarted: 'Recording started, click stop to finish',
    recordingCompleted: 'Speech recognition completed',
    recordingFailed: 'Speech recognition failed, please try again',
    recordingTooLarge: 'Recording too large, please record shorter audio',
    microphoneAccessDenied: 'Cannot access microphone, please check permissions',

    // Loading stages
    reading: 'Reading...',
    uploading: 'Uploading images...',
    responding: 'Responding...',

    // Entry management
    confirmDelete: 'Are you sure you want to delete this entry? This action cannot be undone.',
    designQuote: 'Design Quote',
    deleteEntry: 'Delete entry',
    deleting: 'Deleting...',
    delete: 'Delete',
    export: 'Export',
    searchEntries: 'Search entries...',
    noMatchingEntries: 'No entries match your search criteria',
    clearSearch: 'Clear Search',
    daytime: 'Daytime',
    clearAll: 'Clear All',
    showingAll: 'Showing all',
    showingFiltered: 'Showing',
    more: 'more',
    untitledEntry: 'Untitled Entry'
  }
};

// Language management functions
export function getBrowserLanguage(): Language {
  if (typeof window === 'undefined') return 'en';

  const browserLang = navigator.language || navigator.languages?.[0] || 'en-US';

  // Check if it's Chinese related language
  if (browserLang.startsWith('zh')) {
    return 'zh';
  }

  // Default to English for other cases
  return 'en';
}

export function getYellowboxLanguage(): Language {
  if (typeof window === 'undefined') return 'en';

  const savedLang = localStorage.getItem('yellowbox-language') as Language;

  // If user hasn't manually set language before, default to English
  if (!savedLang) {
    // Set default language to English
    localStorage.setItem('yellowbox-language', 'en');
    return 'en';
  }

  return savedLang;
}

export function setYellowboxLanguage(lang: Language): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('yellowbox-language', lang);
}

export function getYellowboxTranslations(lang?: Language): YellowboxTranslations {
  const currentLang = lang || getYellowboxLanguage();
  return yellowboxTranslations[currentLang];
}

export function t(key: keyof YellowboxTranslations, lang?: Language): string | string[] {
  const trans = getYellowboxTranslations(lang);
  return trans[key];
}

// Hook for React components
export function useYellowboxTranslation() {
  const [lang, setLang] = useState<Language>('en');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Only execute language detection on client side
    if (typeof window !== 'undefined' && !isInitialized) {
      const detectedLang = getYellowboxLanguage();
      setLang(detectedLang);
      setIsInitialized(true);
    }
  }, [isInitialized]);

  // Listen for language change events
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleLanguageChange = () => {
      const currentLang = getYellowboxLanguage();
      setLang(currentLang);
    };

    window.addEventListener('yellowboxLanguageChanged', handleLanguageChange);
    return () => window.removeEventListener('yellowboxLanguageChanged', handleLanguageChange);
  }, []);

  const trans = getYellowboxTranslations(lang);

  const handleSetLanguage = (newLang: Language) => {
    setYellowboxLanguage(newLang);
    setLang(newLang);

    // Trigger language change event so other components can also update immediately
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('yellowboxLanguageChanged'));
    }
  };

  return {
    t: (key: keyof YellowboxTranslations) => trans[key],
    lang,
    setLang: handleSetLanguage,
    translations: trans,
    isInitialized
  };
}