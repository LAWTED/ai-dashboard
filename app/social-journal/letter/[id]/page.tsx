'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Send, Mail, Clock, User, AlertCircle } from 'lucide-react';
import { getLetter, answerLetter, getUserFromLocal, type Letter } from '@/lib/social-journal';

export default function LetterDetailPage() {
  const router = useRouter();
  const params = useParams();
  const letterId = params.id as string;

  const [letter, setLetter] = useState<Letter | null>(null);
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [currentUser, setCurrentUser] = useState(getUserFromLocal());

  useEffect(() => {
    // 检查用户登录状态
    const user = getUserFromLocal();
    if (!user) {
      router.push('/social-journal/login');
      return;
    }
    setCurrentUser(user);
    loadLetter();
  }, [letterId, router]);

    const loadLetter = async () => {
    if (!currentUser) return;

    setIsLoading(true);
    try {
      const letterData = await getLetter(letterId);
      if (!letterData) {
        setError('信件不存在或无法访问');
        return;
      }

      // 检查权限：只有发送者和接收者可以查看
      if (letterData.sender_code !== currentUser.invite_code &&
          letterData.receiver_code !== currentUser.invite_code) {
        setError('您没有权限查看此信件');
        return;
      }

      setLetter(letterData);
    } catch (e) {
      console.error('Error loading letter:', e);
      setError('加载信件时出现错误');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) {
      setError('请输入回答内容');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const success = await answerLetter(letterId, answer.trim());

      if (success) {
        setSuccess(true);
        // 重新加载信件以显示更新后的状态
        await loadLetter();
        setTimeout(() => {
          router.push('/social-journal');
        }, 2000);
      } else {
        setError('提交回答失败，请稍后重试');
      }
    } catch (e) {
      console.error('Error submitting answer:', e);
      setError('提交过程中出现错误，请稍后重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (error && !letter) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">出错了</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => router.push('/social-journal')}>
              返回主页
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!letter || !currentUser) return null;

  const isReceived = letter.receiver_code === currentUser.invite_code;
  const isSent = letter.sender_code === currentUser.invite_code;
  const isAnswered = letter.status === 'answered';
  const canAnswer = isReceived && !isAnswered;

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <Mail className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">回答成功！</h2>
            <p className="text-gray-600 mb-4">
              你的回答已发送给 #{letter.sender_code}
            </p>
            <p className="text-sm text-gray-500">
              即将返回主页...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* 头部 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/social-journal')}
              className="mr-3"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-xl font-bold text-gray-900">
              {isReceived ? '收到的问题' : '发出的问题'}
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* 信件信息 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center">
                  <Mail className="w-5 h-5 mr-2 text-blue-600" />
                  信件详情
                </CardTitle>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  isAnswered
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {isAnswered ? '已回答' : '待回答'}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 发送者/接收者信息 */}
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  <span>
                    {isReceived ? `发件人: #${letter.sender_code}` : `收件人: #${letter.receiver_code}`}
                  </span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>
                    {new Date(letter.created_at).toLocaleDateString('zh-CN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>

              {/* 问题内容 */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">问题</h3>
                <p className="text-blue-800 leading-relaxed">{letter.question}</p>
              </div>
            </CardContent>
          </Card>

          {/* 回答部分 */}
          {isAnswered && letter.answer && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-green-700">回答</CardTitle>
                {letter.answered_at && (
                  <p className="text-sm text-gray-500 flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    回答于 {new Date(letter.answered_at).toLocaleDateString('zh-CN', {
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-green-800 leading-relaxed">{letter.answer}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 回答输入框（仅收到的未回答问题显示） */}
          {canAnswer && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">你的回答</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="请输入你的回答..."
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  rows={4}
                  maxLength={500}
                  className="resize-none"
                />
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">
                    {answer.length}/500 字符
                  </p>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  onClick={handleSubmitAnswer}
                  disabled={isSubmitting || !answer.trim()}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  size="lg"
                >
                  {isSubmitting ? (
                    '提交中...'
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      提交回答
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* 状态说明 */}
          {isSent && !isAnswered && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="pt-6">
                <p className="text-sm text-yellow-800 text-center">
                  问题已发送，等待好友回答
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}