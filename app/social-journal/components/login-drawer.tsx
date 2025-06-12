"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { Drawer } from "vaul";
import { createClient } from "@/lib/supabase/client";
import { useSocialJournalStore } from "@/lib/store/social-journal-store";
import { triggerSplineObject, SPLINE_OBJECTS } from "@/lib/spline-utils";

// 简单的密码哈希函数（生产环境应使用更安全的方法）
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default function LoginDrawer() {
  const router = useRouter();
  const { loginOpen, setLoginOpen, closeLogin } = useSocialJournalStore();
  const [isLogin, setIsLogin] = useState(true);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!phone.trim()) {
      setError("请输入手机号");
      return;
    }

    if (!password.trim()) {
      setError("请输入密码");
      return;
    }

    if (!isLogin && !name.trim()) {
      setError("请输入姓名");
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setError("密码确认不匹配");
      return;
    }

    if (!isLogin && password.length < 6) {
      setError("密码长度至少6位");
      return;
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        // 登录逻辑
        const passwordHash = await hashPassword(password);

        const { data: users, error } = await supabase
          .from("custom_users")
          .select("*")
          .eq("phone", phone)
          .eq("password_hash", passwordHash)
          .eq("is_active", true)
          .single();

        if (error || !users) {
          setError("手机号或密码错误");
          return;
        }

        // 登录成功，可以在这里设置会话状态
        localStorage.setItem(
          "currentUser",
          JSON.stringify({
            id: users.id,
            phone: users.phone,
            name: users.name,
            invite_code: users.invite_code,
          })
        );

        closeLogin();
        router.push("/social-journal");
      } else {
        // 注册逻辑
        // 检查手机号是否已存在
        const { data: existingUser } = await supabase
          .from("custom_users")
          .select("phone")
          .eq("phone", phone)
          .single();

        if (existingUser) {
          setError("手机号已存在，请尝试登录");
          return;
        }

        // 生成邀请码
        const inviteCode = Math.random()
          .toString(36)
          .substring(2, 8)
          .toUpperCase();

        // 哈希密码
        const passwordHash = await hashPassword(password);

        // 创建新用户
        const { data: newUser, error } = await supabase
          .from("custom_users")
          .insert([
            {
              phone: phone,
              password_hash: passwordHash,
              name: name,
              invite_code: inviteCode,
            },
          ])
          .select()
          .single();

        if (error) {
          console.error("Registration error:", error);
          setError(`注册失败: ${error.message}`);
          return;
        }

        if (newUser) {
          // 注册成功，设置会话状态
          localStorage.setItem(
            "currentUser",
            JSON.stringify({
              id: newUser.id,
              phone: newUser.phone,
              name: newUser.name,
              invite_code: newUser.invite_code,
            })
          );

          closeLogin();
          router.push("/social-journal");
        }
      }
    } catch (e) {
      console.error("Auth error:", e);
      setError("认证过程中出现错误，请稍后重试");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setPhone("");
    setPassword("");
    setConfirmPassword("");
    setName("");
    setError("");
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleOpenChange = (open: boolean) => {
    setLoginOpen(open);
    if (!open) {
      triggerSplineObject(SPLINE_OBJECTS.LETTER_COVER_CLOSE);
      resetForm();
    }
  };

  return (
    <Drawer.Root open={loginOpen} onOpenChange={handleOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-transparent " />
        <Drawer.Title className="sr-only">登录</Drawer.Title>
        <Drawer.Content className="bg-black/10 backdrop-blur-md border-t border-white/20 flex flex-col rounded-t-[20px] h-fit mt-24 fixed bottom-0 left-0 right-0">
          <div className="p-4 bg-transparent rounded-t-[20px] flex-1">
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-white/30 mb-8" />

            <Card className="bg-transparent border-none shadow-none">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-gray-800">
                  {isLogin ? "登录" : "注册"}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-6 pb-8">
                <form onSubmit={handleAuth} className="space-y-4">
                  {!isLogin && (
                    <div className="space-y-2">
                      <Label
                        htmlFor="name"
                        className="text-gray-800 font-medium"
                      >
                        姓名
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="请输入姓名"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        maxLength={20}
                        className="bg-white/20 backdrop-blur-sm border-white/30 text-gray-800 placeholder:text-gray-500 focus:bg-white/30 focus:border-white/50 h-12"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label
                      htmlFor="phone"
                      className="text-gray-800 font-medium"
                    >
                      手机号
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="请输入手机号"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      maxLength={11}
                      className="bg-white/20 backdrop-blur-sm border-white/30 text-gray-800 placeholder:text-gray-500 focus:bg-white/30 focus:border-white/50 h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="password"
                      className="text-gray-800 font-medium"
                    >
                      密码
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="请输入密码"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-white/20 backdrop-blur-sm border-white/30 text-gray-800 placeholder:text-gray-500 focus:bg-white/30 focus:border-white/50 h-12 pr-12"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-12 px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-600" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-600" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {!isLogin && (
                    <div className="space-y-2">
                      <Label
                        htmlFor="confirmPassword"
                        className="text-gray-800 font-medium"
                      >
                        确认密码
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="请再次输入密码"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="bg-white/20 backdrop-blur-sm border-white/30 text-gray-800 placeholder:text-gray-500 focus:bg-white/30 focus:border-white/50 h-12 pr-12"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-12 px-3 py-2 hover:bg-transparent"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-600" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-600" />
                          )}
                        </Button>
                      </div>
                    </div>
                  )}

                  {error && (
                    <Alert
                      variant="destructive"
                      className="bg-red-500/20 backdrop-blur-sm border-red-400/30 text-gray-800"
                    >
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-gray-800">
                        {error}
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-black/20 backdrop-blur-sm border-white/30 text-gray-800 hover:bg-white/30 hover:border-white/50 disabled:bg-white/10 disabled:text-gray-400 h-12 text-lg font-medium"
                    disabled={
                      isLoading ||
                      !phone.trim() ||
                      !password.trim() ||
                      (!isLogin && !name.trim()) ||
                      (!isLogin && password !== confirmPassword)
                    }
                  >
                    {isLoading ? "处理中..." : isLogin ? "登录" : "注册"}
                  </Button>
                </form>

                <div className="text-center pt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setIsLogin(!isLogin);
                      resetForm();
                    }}
                    className="text-gray-700 hover:text-gray-800 hover:bg-white/10"
                  >
                    {isLogin ? "没有账号？立即注册" : "已有账号？立即登录"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
