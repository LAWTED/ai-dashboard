import { supabase } from './supabase';
import { getLanguage } from './i18n/social-journal';

export type User = {
  id: string;
  invite_code: string;
  name: string;
  phone: string;
  created_at: string;
};

export type Letter = {
  id: string;
  sender_code: string;
  receiver_code: string;
  question: string;
  question_id: string | null;
  answer: string | null;
  status: 'sent' | 'answered';
  created_at: string;
  answered_at: string | null;
};

export type Question = {
  id: string;
  question_text: string;
  question_text_en: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

// 从数据库获取问题库
export async function getQuestionsFromDB(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('is_active', true)
      .order('order_index', { ascending: true });

    if (error) {
      console.error('Error fetching questions from database:', error);
      return [];
    }

    if (!data || data.length === 0) {
      console.log('No questions found in database');
      return [];
    }

    const currentLang = getLanguage();
    return data.map((q: Question) =>
      currentLang === 'en' ? q.question_text_en : q.question_text
    );
  } catch (e) {
    console.error('Error fetching questions from database:', e);
    return [];
  }
}

// 从数据库随机获取4个问题
export async function getRandomQuestionsFromDB(count: number = 4): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching questions from database:', error);
      return [];
    }

    if (!data || data.length === 0) {
      console.log('No questions found in database');
      return [];
    }

    // 随机打乱数组并取前count个
    const shuffled = [...data].sort(() => Math.random() - 0.5);
    const selectedQuestions = shuffled.slice(0, Math.min(count, data.length));

    const currentLang = getLanguage();
    return selectedQuestions.map((q: Question) =>
      currentLang === 'en' ? q.question_text_en : q.question_text
    );
  } catch (e) {
    console.error('Error fetching random questions from database:', e);
    return [];
  }
}

// 获取问题使用统计（可选功能）
export async function getQuestionStats(): Promise<Array<{question_text: string, question_text_en: string, usage_count: number}>> {
  try {
    const { data, error } = await supabase
      .from('questions')
      .select(`
        question_text,
        question_text_en,
        letters!inner(question_id)
      `)
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching question stats:', error);
      return [];
    }

    // Count usage for each question
    const stats = data?.map(q => ({
      question_text: q.question_text,
      question_text_en: q.question_text_en,
      usage_count: q.letters?.length || 0
    })) || [];

    return stats.sort((a, b) => b.usage_count - a.usage_count);
  } catch (e) {
    console.error('Error fetching question stats:', e);
    return [];
  }
}

// 管理员功能：添加新问题
export async function addQuestion(questionTextEn: string, questionTextZh: string, orderIndex?: number): Promise<boolean> {
  try {
    // If no order index provided, get the next available one
    if (!orderIndex) {
      const { data: maxOrder } = await supabase
        .from('questions')
        .select('order_index')
        .order('order_index', { ascending: false })
        .limit(1);

      orderIndex = (maxOrder?.[0]?.order_index || 0) + 1;
    }

    const { error } = await supabase
      .from('questions')
      .insert({
        question_text_en: questionTextEn,
        question_text: questionTextZh,
        order_index: orderIndex,
        is_active: true
      });

    if (error) {
      console.error('Error adding question:', error);
      return false;
    }

    return true;
  } catch (e) {
    console.error('Error adding question:', e);
    return false;
  }
}

// 管理员功能：停用问题
export async function deactivateQuestion(questionId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('questions')
      .update({ is_active: false })
      .eq('id', questionId);

    if (error) {
      console.error('Error deactivating question:', error);
      return false;
    }

    return true;
  } catch (e) {
    console.error('Error deactivating question:', e);
    return false;
  }
}

// 保持向后兼容的问题库 (默认中文)
export const QUESTIONS = [
  "今天最让你开心的事情是什么？",
  "你最近在思考什么问题？",
  "如果可以和任何人吃饭，你会选择谁？",
  "你童年最美好的回忆是什么？",
  "你最想去的地方是哪里？",
  "你最近学到了什么新东西？",
  "你觉得什么品质在朋友身上最重要？",
  "你最喜欢的季节是什么，为什么？"
];

// 用户相关操作
export async function checkInviteCode(code: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('custom_users')
      .select('*')
      .eq('invite_code', code)
      .eq('is_active', true)
      .single();

    if (error) {
      console.log('Invite code not found:', error);
      return null;
    }

    return data;
  } catch (e) {
    console.error('Error checking invite code:', e);
    return null;
  }
}

export async function createUser(inviteCode: string, name: string, phone: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('custom_users')
      .insert({ invite_code: inviteCode, name, phone })
      .select()
      .single();

    if (error) {
      console.error('Error creating user:', error);
      return null;
    }

    return data;
  } catch (e) {
    console.error('Error creating user:', e);
    return null;
  }
}

// 获取随机用户（排除自己）
export async function getRandomUser(excludeCode: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('custom_users')
      .select('*')
      .eq('is_active', true)
      .neq('invite_code', excludeCode);

    if (error) {
      console.error('Error fetching random user:', error);
      return null;
    }

    if (!data || data.length === 0) {
      console.log('No other users found');
      return null;
    }

    // 随机选择一个用户
    const randomIndex = Math.floor(Math.random() * data.length);
    return data[randomIndex];
  } catch (e) {
    console.error('Error getting random user:', e);
    return null;
  }
}

// 信件相关操作
export async function getMyLetters(myCode: string): Promise<Letter[]> {
  try {
    const { data: receivedLetters, error: receivedError } = await supabase
      .from('letters')
      .select('*')
      .eq('receiver_code', myCode)
      .order('created_at', { ascending: false });

    const { data: sentLetters, error: sentError } = await supabase
      .from('letters')
      .select('*')
      .eq('sender_code', myCode)
      .order('created_at', { ascending: false });

    if (receivedError || sentError) {
      console.error('Error fetching letters:', receivedError || sentError);
      return [];
    }

    // 合并收发件并按时间排序
    const allLetters = [...(receivedLetters || []), ...(sentLetters || [])];
    return allLetters.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } catch (e) {
    console.error('Error fetching letters:', e);
    return [];
  }
}

export async function sendLetter(senderCode: string, receiverCode: string, question: string): Promise<boolean> {
  try {
    // Get question_id for the question text
    const { data: questionData, error: questionError } = await supabase
      .rpc('get_question_id_by_text', { question_text_param: question });

    if (questionError) {
      console.warn('Could not find question_id for question:', question, questionError);
    }

    const { error } = await supabase
      .from('letters')
      .insert({
        sender_code: senderCode,
        receiver_code: receiverCode,
        question,
        question_id: questionData || null,
        status: 'sent'
      });

    if (error) {
      console.error('Error sending letter:', error);
      return false;
    }

    return true;
  } catch (e) {
    console.error('Error sending letter:', e);
    return false;
  }
}

export async function getLetter(letterId: string): Promise<Letter | null> {
  try {
    const { data, error } = await supabase
      .from('letters')
      .select('*')
      .eq('id', letterId)
      .single();

    if (error) {
      console.error('Error fetching letter:', error);
      return null;
    }

    return data;
  } catch (e) {
    console.error('Error fetching letter:', e);
    return null;
  }
}

export async function answerLetter(letterId: string, answer: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('letters')
      .update({
        answer,
        status: 'answered',
        answered_at: new Date().toISOString()
      })
      .eq('id', letterId);

    if (error) {
      console.error('Error answering letter:', error);
      return false;
    }

    return true;
  } catch (e) {
    console.error('Error answering letter:', e);
    return false;
  }
}

// 本地存储操作 - 统一使用 currentUser 键名
export function saveUserToLocal(user: User): void {
  localStorage.setItem('currentUser', JSON.stringify(user));
}

export function getUserFromLocal(): User | null {
  try {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) return null;
    return JSON.parse(userStr);
  } catch (e) {
    console.error('Error parsing user from localStorage:', e);
    return null;
  }
}

export function clearUserFromLocal(): void {
  localStorage.removeItem('currentUser');
}

// 生成随机6位邀请码（大写字母和数字）
export function generateInviteCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}