"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Send, AlertCircle, Mail } from "lucide-react";
import {
  QUESTIONS,
  sendLetter,
  checkInviteCode,
  getUserFromLocal,
} from "@/lib/social-journal";
import { Drawer } from "vaul";
import { useSocialJournalStore } from "@/lib/store/social-journal-store";

export default function SendLetterDrawer() {
  const { sendLetterOpen, setSendLetterOpen, closeSendLetter } =
    useSocialJournalStore();

  const [selectedQuestion, setSelectedQuestion] = useState("");
  const [friendCode, setFriendCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [currentUser] = useState(getUserFromLocal());

  const refreshLetters = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('refreshLetters'));
    }
  };

  const handleSend = async () => {
    setError("");

    if (!currentUser) {
      setError("用户未登录");
      return;
    }

    if (!selectedQuestion) {
      setError("请选择一个问题");
      return;
    }

    if (!friendCode || friendCode.length !== 4) {
      setError("请输入好友的4位邀请码");
      return;
    }

    if (friendCode === currentUser.invite_code) {
      setError("不能发送给自己");
      return;
    }

    setIsLoading(true);

    try {
      // 检查好友邀请码是否存在
      const friendExists = await checkInviteCode(friendCode);
      if (!friendExists) {
        setError("好友邀请码不存在，请确认后重试");
        setIsLoading(false);
        return;
      }

      // 发送信件
      const success = await sendLetter(
        currentUser.invite_code,
        friendCode,
        selectedQuestion
      );

      if (success) {
        setSuccess(true);
        setTimeout(() => {
          closeSendLetter();
          setSuccess(false);
          setSelectedQuestion("");
          setFriendCode("");
          refreshLetters();
        }, 2000);
      } else {
        setError("发送失败，请稍后重试");
      }
    } catch (e) {
      console.error("Send error:", e);
      setError("发送过程中出现错误，请稍后重试");
    } finally {
      setIsLoading(false);
    }
  };

  if (!sendLetterOpen) return null;

  return (
    <Drawer.NestedRoot open={sendLetterOpen} onOpenChange={setSendLetterOpen}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-transparent" />
        <Drawer.Content className="bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl flex flex-col rounded-t-[10px] h-full mt-24 max-h-[94%] fixed bottom-0 left-0 right-0">
          <div className="p-6 flex-1 max-h-[85vh] overflow-y-auto">
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-white/30 mb-6" />

            {success ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-500/20 backdrop-blur-sm border border-green-400/30 rounded-full flex items-center justify-center">
                  <Mail className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  发送成功！
                </h2>
                <p className="text-gray-600 mb-4">
                  问题已发送给好友 #{friendCode}
                </p>
                <p className="text-sm text-gray-500">即将关闭...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* 头部 */}
                <div className="flex items-center mb-6">
                  <h1 className="text-xl font-bold text-gray-900">发送问题</h1>
                </div>

                {/* 选择问题 */}
                <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    选择一个问题
                  </h3>
                  <div className="grid gap-3">
                    {QUESTIONS.map((question, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedQuestion(question)}
                        className={`p-4 text-left rounded-lg border transition-all ${
                          selectedQuestion === question
                            ? "border-blue-500/50 bg-blue-500/20 text-blue-900 backdrop-blur-sm"
                            : "border-white/30 hover:border-white/40 bg-white/10 backdrop-blur-sm text-gray-800 hover:bg-white/20"
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{question}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 输入好友邀请码 */}
                <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    输入好友邀请码
                  </h3>
                  <div className="space-y-3">
                    <Label htmlFor="friendCode" className="text-gray-700">
                      好友的4位邀请码
                    </Label>
                    <Input
                      id="friendCode"
                      type="text"
                      placeholder="请输入4位数字"
                      value={friendCode}
                      onChange={(e) => {
                        const value = e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 4);
                        setFriendCode(value);
                      }}
                      maxLength={4}
                      className="text-center text-lg font-mono tracking-wider bg-white/10 backdrop-blur-sm border-white/30 text-gray-800 placeholder:text-gray-500"
                    />
                    <p className="text-xs text-gray-600">
                      请确认好友的邀请码，发送后好友将收到你的问题
                    </p>
                  </div>
                </div>

                {/* 预览 */}
                {selectedQuestion && friendCode && (
                  <div className="bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 rounded-2xl p-4">
                    <h3 className="text-base font-medium text-blue-900 mb-3">
                      发送预览
                    </h3>
                    <div className="space-y-2">
                      <p className="text-sm text-blue-800">
                        <strong>问题:</strong> {selectedQuestion}
                      </p>
                      <p className="text-sm text-blue-800">
                        <strong>发送给:</strong> 好友 #{friendCode}
                      </p>
                    </div>
                  </div>
                )}

                {/* 错误提示 */}
                {error && (
                  <Alert
                    variant="destructive"
                    className="bg-red-500/20 backdrop-blur-sm border-red-400/30"
                  >
                    <AlertCircle className="h-4 w-4 text-red-300" />
                    <AlertDescription className="text-red-200">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                {/* 发送按钮 */}
                <Button
                  onClick={handleSend}
                  disabled={isLoading || !selectedQuestion || !friendCode}
                  className="w-full bg-blue-600/80 backdrop-blur-sm hover:bg-blue-700/80 text-white py-3 border border-blue-500/30"
                  size="lg"
                >
                  {isLoading ? (
                    "发送中..."
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      发送问题
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.NestedRoot>
  );
}