import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { type Letter } from '@/lib/social-journal';

export function useLettersRealtime(userCode: string | null) {
  const [letters, setLetters] = useState<Letter[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userCode) {
      setLetters([]);
      setIsLoading(false);
      return;
    }

    const supabase = createClient();

    // 初始加载信件
    const loadInitialLetters = async () => {
      setIsLoading(true);
      try {
        const { data: receivedLetters, error: receivedError } = await supabase
          .from('letters')
          .select('*')
          .eq('receiver_code', userCode)
          .order('created_at', { ascending: false });

        const { data: sentLetters, error: sentError } = await supabase
          .from('letters')
          .select('*')
          .eq('sender_code', userCode)
          .order('created_at', { ascending: false });

        if (receivedError || sentError) {
          console.error('Error fetching letters:', receivedError || sentError);
          return;
        }

        // 合并收发件并按时间排序
        const allLetters = [...(receivedLetters || []), ...(sentLetters || [])];
        const sortedLetters = allLetters.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        setLetters(sortedLetters);
      } catch (error) {
        console.error('Error loading letters:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialLetters();

    // 处理信件变化的通用函数
    const handleLetterChange = (payload: {
      eventType: string;
      new?: Letter;
      old?: Letter;
    }) => {
      console.log('Letters change received:', payload);

      const newLetter = payload.new;
      const oldLetter = payload.old;

      setLetters((currentLetters) => {
        switch (payload.eventType) {
          case 'INSERT':
            // 添加新信件，检查是否已存在以避免重复
            if (newLetter && !currentLetters.find(l => l.id === newLetter.id)) {
              const updatedLetters = [newLetter, ...currentLetters];
              return updatedLetters.sort(
                (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
              );
            }
            return currentLetters;

          case 'UPDATE':
            // 更新现有信件
            if (newLetter) {
              return currentLetters.map(letter =>
                letter.id === newLetter.id ? newLetter : letter
              );
            }
            return currentLetters;

          case 'DELETE':
            // 删除信件
            if (oldLetter) {
              return currentLetters.filter(letter => letter.id !== oldLetter.id);
            }
            return currentLetters;

          default:
            return currentLetters;
        }
      });
    };

    // 设置 Realtime 订阅 - 接收的信件
    const receivedChannel = supabase
      .channel('received-letters-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'letters',
          filter: `receiver_code=eq.${userCode}`,
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (payload) => handleLetterChange(payload as any)
      )
      .subscribe();

    // 设置 Realtime 订阅 - 发送的信件
    const sentChannel = supabase
      .channel('sent-letters-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'letters',
          filter: `sender_code=eq.${userCode}`,
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (payload) => handleLetterChange(payload as any)
      )
      .subscribe();

    // 清理函数
    return () => {
      supabase.removeChannel(receivedChannel);
      supabase.removeChannel(sentChannel);
    };
  }, [userCode]);

  return { letters, isLoading, refreshLetters: () => {} }; // refreshLetters 不再需要，因为是实时的
}