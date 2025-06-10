import { supabase } from './supabase';

export type User = {
  id: string;
  invite_code: string;
  name: string;
  created_at: string;
};

export type Letter = {
  id: string;
  sender_code: string;
  receiver_code: string;
  question: string;
  answer: string | null;
  status: 'sent' | 'answered';
  created_at: string;
  answered_at: string | null;
};

// 问题库 (前端写死)
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
      .from('users')
      .select('*')
      .eq('invite_code', code)
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

export async function createUser(inviteCode: string, name: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert({ invite_code: inviteCode, name })
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
    const { error } = await supabase
      .from('letters')
      .insert({
        sender_code: senderCode,
        receiver_code: receiverCode,
        question,
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

// 本地存储操作
export function saveUserToLocal(user: User): void {
  localStorage.setItem('social_journal_user', JSON.stringify(user));
}

export function getUserFromLocal(): User | null {
  try {
    const userStr = localStorage.getItem('social_journal_user');
    if (!userStr) return null;
    return JSON.parse(userStr);
  } catch (e) {
    console.error('Error parsing user from localStorage:', e);
    return null;
  }
}

export function clearUserFromLocal(): void {
  localStorage.removeItem('social_journal_user');
}

// 生成随机4位邀请码
export function generateInviteCode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}