'use client';

import { useState, useEffect } from 'react';

export type Language = 'zh' | 'en';

export interface Translations {
  // App metadata
  appName: string;
  appDescription: string;

  // Navigation and UI
  login: string;
  register: string;
  logout: string;
  loading: string;
  submit: string;
  cancel: string;
  confirm: string;
  back: string;
  close: string;

  // User authentication
  phone: string;
  password: string;
  confirmPassword: string;
  name: string;
  inviteCode: string;
  loginTitle: string;
  registerTitle: string;
  loginButton: string;
  registerButton: string;
  noAccount: string;
  hasAccount: string;

  // Main interface
  hello: string;
  sendNewQuestion: string;
  myLetters: string;
  shareInviteCode: string;
  friendsCanSendQuestions: string;

  // Letter statuses
  pending: string;
  answered: string;
  receivedReply: string;
  waitingReply: string;

  // Letter details
  sender: string;
  receiver: string;
  question: string;
  answer: string;
  yourAnswer: string;
  submitAnswer: string;
  letterDetails: string;
  receivedQuestion: string;
  sentQuestion: string;
  answeredAt: string;

  // Send letter
  sendQuestion: string;
  selectQuestion: string;
  enterFriendCode: string;
  friendInviteCode: string;
  sendPreview: string;
  sendTo: string;
  sending: string;
  sendSuccess: string;
  questionSentTo: string;

  // Empty states
  noLetters: string;
  sendFirstQuestion: string;

  // Error messages
  phoneRequired: string;
  passwordRequired: string;
  nameRequired: string;
  passwordMismatch: string;
  passwordTooShort: string;
  phoneOrPasswordWrong: string;
  phoneExists: string;
  registrationFailed: string;
  authError: string;
  questionRequired: string;
  inviteCodeRequired: string;
  cannotSendToSelf: string;
  friendCodeNotFound: string;
  sendFailed: string;
  answerRequired: string;
  submitFailed: string;
  letterNotFound: string;
  noPermission: string;
  loadError: string;

  // Success messages
  sendSuccessMessage: string;
  answerSuccessMessage: string;
  answerSentTo: string;

  // Settings
  settings: string;
  accountSettings: string;
  language: string;
  chinese: string;
  english: string;

  // Questions
  questions: string[];

  // Other
  characters: string;
  closingSoon: string;
  questionSent: string;
  waitingForFriend: string;
  inviteCodeComplete: string;
  confirmInviteCode: string;
  userNotFound: string;
  pleaseLogin: string;
}

export const translations: Record<Language, Translations> = {
  zh: {
    // App metadata
    appName: '社交日记',
    appDescription: '与朋友分享日常问题和回答的社交应用',

    // Navigation and UI
    login: '登录',
    register: '注册',
    logout: '登出',
    loading: '加载中...',
    submit: '提交',
    cancel: '取消',
    confirm: '确认',
    back: '返回',
    close: '关闭',

    // User authentication
    phone: '手机号',
    password: '密码',
    confirmPassword: '确认密码',
    name: '姓名',
    inviteCode: '邀请码',
    loginTitle: '登录',
    registerTitle: '注册',
    loginButton: '登录',
    registerButton: '注册',
    noAccount: '没有账号？立即注册',
    hasAccount: '已有账号？立即登录',

    // Main interface
    hello: '你好',
    sendNewQuestion: '发送新问题给朋友',
    myLetters: '我的信件',
    shareInviteCode: '与朋友分享你的邀请码',
    friendsCanSendQuestions: '他们就可以发送问题给你了',

    // Letter statuses
    pending: '待回答',
    answered: '已回答',
    receivedReply: '已收到回复',
    waitingReply: '等待回复',

    // Letter details
    sender: '发件人',
    receiver: '收件人',
    question: '问题',
    answer: '回答',
    yourAnswer: '你的回答',
    submitAnswer: '提交回答',
    letterDetails: '信件详情',
    receivedQuestion: '收到的问题',
    sentQuestion: '发出的问题',
    answeredAt: '回答于',

    // Send letter
    sendQuestion: '发送问题',
    selectQuestion: '选择一个问题',
    enterFriendCode: '输入好友邀请码',
    friendInviteCode: '好友的6位邀请码',
    sendPreview: '发送预览',
    sendTo: '发送给',
    sending: '发送中...',
    sendSuccess: '发送成功！',
    questionSentTo: '问题已发送给好友',

    // Empty states
    noLetters: '还没有信件',
    sendFirstQuestion: '发送你的第一个问题给朋友吧！',

    // Error messages
    phoneRequired: '请输入手机号',
    passwordRequired: '请输入密码',
    nameRequired: '请输入姓名',
    passwordMismatch: '密码确认不匹配',
    passwordTooShort: '密码长度至少6位',
    phoneOrPasswordWrong: '手机号或密码错误',
    phoneExists: '手机号已存在，请尝试登录',
    registrationFailed: '注册失败',
    authError: '认证过程中出现错误，请稍后重试',
    questionRequired: '请选择一个问题',
    inviteCodeRequired: '请输入好友的6位邀请码（字母+数字）',
    cannotSendToSelf: '不能发送给自己',
    friendCodeNotFound: '好友邀请码不存在，请确认后重试',
    sendFailed: '发送失败，请稍后重试',
    answerRequired: '请输入回答内容',
    submitFailed: '提交回答失败，请稍后重试',
    letterNotFound: '信件不存在或无法访问',
    noPermission: '您没有权限查看此信件',
    loadError: '加载信件时出现错误',

    // Success messages
    sendSuccessMessage: '发送成功！',
    answerSuccessMessage: '回答成功！',
    answerSentTo: '你的回答已发送给',

    // Settings
    settings: '设置',
    accountSettings: '账户设置',
    language: '语言',
    chinese: '中文',
    english: 'English',

    // Questions
    questions: [
      '今天最让你开心的事情是什么？',
      '你最近在思考什么问题？',
      '如果可以和任何人吃饭，你会选择谁？',
      '你童年最美好的回忆是什么？',
      '你最想去的地方是哪里？',
      '你最近学到了什么新东西？',
      '你觉得什么品质在朋友身上最重要？',
      '你最喜欢的季节是什么，为什么？'
    ],

    // Other
    characters: '字符',
    closingSoon: '即将关闭...',
    questionSent: '问题已发送，等待好友回答',
    waitingForFriend: '等待好友回答',
    inviteCodeComplete: '邀请码已完整输入',
    confirmInviteCode: '请确认好友的6位邀请码，发送后好友将收到你的问题',
    userNotFound: '用户未找到',
    pleaseLogin: '请重新登录'
  },

  en: {
    // App metadata
    appName: 'Social Journal',
    appDescription: 'A social app for sharing daily questions and answers with friends',

    // Navigation and UI
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    loading: 'Loading...',
    submit: 'Submit',
    cancel: 'Cancel',
    confirm: 'Confirm',
    back: 'Back',
    close: 'Close',

    // User authentication
    phone: 'Phone Number',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    name: 'Name',
    inviteCode: 'Invite Code',
    loginTitle: 'Login',
    registerTitle: 'Register',
    loginButton: 'Login',
    registerButton: 'Register',
    noAccount: "Don't have an account? Register now",
    hasAccount: 'Already have an account? Login now',

    // Main interface
    hello: 'Hello',
    sendNewQuestion: 'Send New Question to Friend',
    myLetters: 'My Letters',
    shareInviteCode: 'Share your invite code with friends',
    friendsCanSendQuestions: 'so they can send questions to you',

    // Letter statuses
    pending: 'Pending',
    answered: 'Answered',
    receivedReply: 'Received Reply',
    waitingReply: 'Waiting Reply',

    // Letter details
    sender: 'Sender',
    receiver: 'Receiver',
    question: 'Question',
    answer: 'Answer',
    yourAnswer: 'Your Answer',
    submitAnswer: 'Submit Answer',
    letterDetails: 'Letter Details',
    receivedQuestion: 'Received Question',
    sentQuestion: 'Sent Question',
    answeredAt: 'Answered at',

    // Send letter
    sendQuestion: 'Send Question',
    selectQuestion: 'Select a Question',
    enterFriendCode: 'Enter Friend Code',
    friendInviteCode: "Friend's 6-digit invite code",
    sendPreview: 'Send Preview',
    sendTo: 'Send to',
    sending: 'Sending...',
    sendSuccess: 'Send Success!',
    questionSentTo: 'Question sent to friend',

    // Empty states
    noLetters: 'No letters yet',
    sendFirstQuestion: 'Send your first question to a friend!',

    // Error messages
    phoneRequired: 'Please enter phone number',
    passwordRequired: 'Please enter password',
    nameRequired: 'Please enter name',
    passwordMismatch: 'Password confirmation does not match',
    passwordTooShort: 'Password must be at least 6 characters',
    phoneOrPasswordWrong: 'Phone number or password is incorrect',
    phoneExists: 'Phone number already exists, please try logging in',
    registrationFailed: 'Registration failed',
    authError: 'An error occurred during authentication, please try again later',
    questionRequired: 'Please select a question',
    inviteCodeRequired: 'Please enter friend\'s 6-digit invite code (letters + numbers)',
    cannotSendToSelf: 'Cannot send to yourself',
    friendCodeNotFound: 'Friend invite code does not exist, please confirm and try again',
    sendFailed: 'Send failed, please try again later',
    answerRequired: 'Please enter answer content',
    submitFailed: 'Failed to submit answer, please try again later',
    letterNotFound: 'Letter does not exist or cannot be accessed',
    noPermission: 'You do not have permission to view this letter',
    loadError: 'An error occurred while loading the letter',

    // Success messages
    sendSuccessMessage: 'Send Success!',
    answerSuccessMessage: 'Answer Success!',
    answerSentTo: 'Your answer has been sent to',

    // Settings
    settings: 'Settings',
    accountSettings: 'Account Settings',
    language: 'Language',
    chinese: '中文',
    english: 'English',

    // Questions
    questions: [
      'What made you happiest today?',
      'What have you been thinking about lately?',
      'If you could have dinner with anyone, who would you choose?',
      'What is your best childhood memory?',
      'Where do you most want to go?',
      'What new thing have you learned recently?',
      'What quality do you think is most important in a friend?',
      'What is your favorite season and why?'
    ],

    // Other
    characters: 'characters',
    closingSoon: 'Closing soon...',
    questionSent: 'Question sent, waiting for friend to answer',
    waitingForFriend: 'Waiting for friend to answer',
    inviteCodeComplete: 'Invite code completely entered',
    confirmInviteCode: 'Please confirm friend\'s 6-digit invite code, friend will receive your question after sending',
    userNotFound: 'User not found',
    pleaseLogin: 'Please login again'
  }
};

// Language management functions
export function getBrowserLanguage(): Language {
  if (typeof window === 'undefined') return 'zh';

  const browserLang = navigator.language || navigator.languages?.[0] || 'zh-CN';

  // 检测是否为中文相关语言
  if (browserLang.startsWith('zh')) {
    return 'zh';
  }

  // 其他情况默认英文
  return 'en';
}

export function getLanguage(): Language {
  if (typeof window === 'undefined') return 'zh';

  const savedLang = localStorage.getItem('social-journal-language') as Language;

  // 如果用户之前没有手动设置过语言，则使用浏览器语言偏好
  if (!savedLang) {
    const browserLang = getBrowserLanguage();
    // 自动保存检测到的语言偏好
    localStorage.setItem('social-journal-language', browserLang);
    return browserLang;
  }

  return savedLang;
}

export function setLanguage(lang: Language): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('social-journal-language', lang);
}

export function getTranslations(lang?: Language): Translations {
  const currentLang = lang || getLanguage();
  return translations[currentLang];
}

export function t(key: keyof Translations, lang?: Language): string {
  const trans = getTranslations(lang);
  return trans[key] as string;
}

// Hook for React components
export function useTranslation() {
  const [lang, setLang] = useState<Language>('zh');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // 只在客户端执行语言检测
    if (typeof window !== 'undefined' && !isInitialized) {
      const detectedLang = getLanguage();
      setLang(detectedLang);
      setIsInitialized(true);
    }
  }, [isInitialized]);

  // 监听语言变化事件
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleLanguageChange = () => {
      const currentLang = getLanguage();
      setLang(currentLang);
    };

    window.addEventListener('languageChanged', handleLanguageChange);
    return () => window.removeEventListener('languageChanged', handleLanguageChange);
  }, []);

  const trans = getTranslations(lang);

  const handleSetLanguage = (newLang: Language) => {
    setLanguage(newLang);
    setLang(newLang);

    // 触发语言变化事件，让其他组件也能立即更新
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('languageChanged'));
    }
  };

  return {
    t: (key: keyof Translations) => trans[key] as string,
    lang,
    setLang: handleSetLanguage,
    translations: trans,
    isInitialized
  };
}