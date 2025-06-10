'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, AlertCircle } from 'lucide-react';
import { checkInviteCode, createUser, saveUserToLocal, generateInviteCode } from '@/lib/social-journal';

export default function LoginPage() {
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!inviteCode || inviteCode.length !== 4) {
      setError('请输入4位邀请码');
      return;
    }

    if (!name.trim()) {
      setError('请输入您的姓名');
      return;
    }

    setIsLoading(true);

    try {
      // 先检查邀请码是否已存在
      const existingUser = await checkInviteCode(inviteCode);

      if (existingUser) {
        // 用户已存在，检查姓名是否匹配
        if (existingUser.name === name.trim()) {
          // 姓名匹配，直接登录
          saveUserToLocal(existingUser);
          router.push('/social-journal');
          return;
        } else {
          // 姓名不匹配，提示错误
          setError('邀请码和姓名不匹配，请检查后重试');
          setIsLoading(false);
          return;
        }
      }

      // 邀请码不存在，创建新用户
      const newUser = await createUser(inviteCode, name.trim());

      if (!newUser) {
        setError('创建用户失败，请稍后重试');
        setIsLoading(false);
        return;
      }

      // 保存到本地存储
      saveUserToLocal(newUser);

      // 跳转到主页
      router.push('/social-journal');
    } catch (e) {
      console.error('Login error:', e);
      setError('登录过程中出现错误，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  const generateRandomCode = () => {
    setInviteCode(generateInviteCode());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
            <Mail className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            社交日记
          </CardTitle>
          <CardDescription>
            输入您的4位邀请码和姓名登录或创建账户
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="inviteCode">邀请码</Label>
              <div className="flex space-x-2">
                <Input
                  id="inviteCode"
                  type="text"
                  placeholder="请输入4位数字"
                  value={inviteCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                    setInviteCode(value);
                  }}
                  maxLength={4}
                  className="text-center text-lg font-mono tracking-wider"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={generateRandomCode}
                  className="px-3"
                >
                  随机
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                如果邀请码已存在会自动登录，否则创建新账户
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">姓名</Label>
              <Input
                id="name"
                type="text"
                placeholder="请输入您的姓名"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={20}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !inviteCode || !name.trim()}
            >
              {isLoading ? '处理中...' : '登录/注册'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              已有账户？输入邀请码和姓名直接登录
              <br />
              新用户？系统会自动创建新账户
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}