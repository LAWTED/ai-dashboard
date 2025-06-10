'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Plus, LogOut } from 'lucide-react';
import { Envelope, EmptyEnvelope } from './components/envelope';
import { getUserFromLocal, clearUserFromLocal, getMyLetters, type User, type Letter } from '@/lib/social-journal';

export default function SocialJournalPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [letters, setLetters] = useState<Letter[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 检查用户登录状态
    const user = getUserFromLocal();
    if (!user) {
      router.push('/social-journal/login');
      return;
    }

    setCurrentUser(user);
    loadLetters(user.invite_code);
  }, [router]);

  const loadLetters = async (inviteCode: string) => {
    setIsLoading(true);
    try {
      const userLetters = await getMyLetters(inviteCode);
      setLetters(userLetters);
    } catch (error) {
      console.error('Error loading letters:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    clearUserFromLocal();
    router.push('/social-journal/login');
  };

  const handleLetterClick = (letterId: string) => {
    router.push(`/social-journal/letter/${letterId}`);
  };

  const handleSendNew = () => {
    router.push('/social-journal/send');
  };

  if (!currentUser) {
    return null; // 重定向中
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* 头部 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">社交日记</h1>
              <p className="text-sm text-gray-500">
                你好, {currentUser.name} (#{currentUser.invite_code})
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="text-gray-600"
              >
                <LogOut className="w-4 h-4 mr-1" />
                登出
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 主内容 */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* 发送新问题按钮 */}
        <div className="mb-6">
          <Button
            onClick={handleSendNew}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
            size="lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            发送新问题给朋友
          </Button>
        </div>

        {/* 信件列表 */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            我的信件 ({letters.length})
          </h2>

          {isLoading ? (
            <EmptyEnvelope type="loading" />
          ) : letters.length === 0 ? (
            <EmptyEnvelope type="no-letters" />
          ) : (
            <div className="space-y-3">
              {letters.map((letter) => (
                <Envelope
                  key={letter.id}
                  letter={letter}
                  currentUser={currentUser}
                  onClick={() => handleLetterClick(letter.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* 页脚说明 */}
        <div className="mt-12 text-center">
          <p className="text-xs text-gray-500">
            与朋友分享你的邀请码 #{currentUser.invite_code}
            <br />
            他们就可以发送问题给你了
          </p>
        </div>
      </main>
    </div>
  );
}