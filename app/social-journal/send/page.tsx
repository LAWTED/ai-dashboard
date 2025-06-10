'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Send, AlertCircle, Mail } from 'lucide-react';
import { QUESTIONS, sendLetter, checkInviteCode, getUserFromLocal } from '@/lib/social-journal';

export default function SendPage() {
  const router = useRouter();
  const [selectedQuestion, setSelectedQuestion] = useState('');
  const [friendCode, setFriendCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const currentUser = getUserFromLocal();

  // 如果未登录，重定向到登录页
  if (!currentUser) {
    router.push('/social-journal/login');
    return null;
  }

  const handleSend = async () => {
    setError('');

    if (!selectedQuestion) {
      setError('请选择一个问题');
      return;
    }

    if (!friendCode || friendCode.length !== 4) {
      setError('请输入好友的4位邀请码');
      return;
    }

    if (friendCode === currentUser.invite_code) {
      setError('不能发送给自己');
      return;
    }

    setIsLoading(true);

    try {
      // 检查好友邀请码是否存在
      const friendExists = await checkInviteCode(friendCode);
      if (!friendExists) {
        setError('好友邀请码不存在，请确认后重试');
        setIsLoading(false);
        return;
      }

      // 发送信件
      const success = await sendLetter(currentUser.invite_code, friendCode, selectedQuestion);

      if (success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/social-journal');
        }, 2000);
      } else {
        setError('发送失败，请稍后重试');
      }
    } catch (e) {
      console.error('Send error:', e);
      setError('发送过程中出现错误，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <Mail className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">发送成功！</h2>
            <p className="text-gray-600 mb-4">
              问题已发送给好友 #{friendCode}
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
            <h1 className="text-xl font-bold text-gray-900">发送问题</h1>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* 选择问题 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">选择一个问题</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {QUESTIONS.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedQuestion(question)}
                    className={`p-4 text-left rounded-lg border transition-all ${
                      selectedQuestion === question
                        ? 'border-blue-500 bg-blue-50 text-blue-900'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{question}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 输入好友邀请码 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">输入好友邀请码</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Label htmlFor="friendCode">好友的4位邀请码</Label>
                <Input
                  id="friendCode"
                  type="text"
                  placeholder="请输入4位数字"
                  value={friendCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                    setFriendCode(value);
                  }}
                  maxLength={4}
                  className="text-center text-lg font-mono tracking-wider"
                />
                <p className="text-xs text-gray-500">
                  请确认好友的邀请码，发送后好友将收到你的问题
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 错误提示 */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* 发送按钮 */}
          <Button
            onClick={handleSend}
            disabled={isLoading || !selectedQuestion || !friendCode}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
            size="lg"
          >
            {isLoading ? (
              '发送中...'
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                发送问题
              </>
            )}
          </Button>

          {/* 预览 */}
          {selectedQuestion && friendCode && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-base text-blue-900">发送预览</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-blue-800 mb-2">
                  <strong>问题:</strong> {selectedQuestion}
                </p>
                <p className="text-sm text-blue-800">
                  <strong>发送给:</strong> 好友 #{friendCode}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}