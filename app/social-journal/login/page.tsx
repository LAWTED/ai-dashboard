"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import {
  checkInviteCode,
  createUser,
  saveUserToLocal,
  generateInviteCode,
} from "@/lib/social-journal";

export default function LoginPage() {
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!inviteCode || inviteCode.length !== 4) {
      setError("请输入4位邀请码");
      return;
    }

    if (!name.trim()) {
      setError("请输入您的姓名");
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

          router.push("/social-journal");
          return;
        } else {
          // 姓名不匹配，提示错误
          setError("邀请码和姓名不匹配，请检查后重试");
          setIsLoading(false);
          return;
        }
      }

      // 邀请码不存在，创建新用户
      const newUser = await createUser(inviteCode, name.trim());

      if (!newUser) {
        setError("创建用户失败，请稍后重试");
        setIsLoading(false);
        return;
      }

      // 保存到本地存储
      saveUserToLocal(newUser);

      // 延迟跳转，让动画有时间播放
      router.push("/social-journal");
    } catch (e) {
      console.error("Login error:", e);
      setError("登录过程中出现错误，请稍后重试");
    } finally {
      setIsLoading(false);
    }
  };

  const generateRandomCode = () => {
    setInviteCode(generateInviteCode());
  };

  return (
    <div className="min-h-screen bg-transparent flex items-end justify-center pb-32 pt-8 px-4 pointer-events-none">
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl">
        <CardContent className="bg-transparent">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="inviteCode" className="text-gray-800 font-medium">
                邀请码
              </Label>
              <div className="flex space-x-2">
                <Input
                  id="inviteCode"
                  type="text"
                  placeholder="请输入4位数字"
                  value={inviteCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 4);
                    setInviteCode(value);
                  }}
                  maxLength={4}
                  className="text-center pointer-events-auto text-lg font-mono tracking-wider bg-white/20 backdrop-blur-sm border-white/30 text-gray-800 placeholder:text-gray-500 focus:bg-white/30 focus:border-white/50"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={generateRandomCode}
                  className="px-3 bg-white/20 pointer-events-auto backdrop-blur-sm border-white/30 text-gray-800 hover:bg-white/30 hover:border-white/50"
                >
                  随机
                </Button>
              </div>
              <p className="text-xs text-gray-600">
                如果邀请码已存在会自动登录，否则创建新账户
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-800 font-medium">
                姓名
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="请输入您的姓名"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={20}
                className="bg-white/20 pointer-events-auto backdrop-blur-sm border-white/30 text-gray-800 placeholder:text-gray-500 focus:bg-white/30 focus:border-white/50"
              />
            </div>

            {error && (
              <Alert
                variant="destructive"
                className="bg-red-500/20 backdrop-blur-sm border-red-400/30 text-gray-800"
              >
                <AlertCircle className="h-4 w-4 text-red-300" />
                <AlertDescription className="text-gray-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full bg-black/10 pointer-events-auto backdrop-blur-sm border-white/30 text-gray-800 hover:bg-white/30 hover:border-white/50 disabled:bg-white/10 disabled:text-gray-400"
              disabled={isLoading || !inviteCode || !name.trim()}
            >
              {isLoading ? "处理中..." : "登录/注册"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
