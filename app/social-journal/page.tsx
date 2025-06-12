"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Envelope, EmptyEnvelope } from "./components/envelope";
import {
  getUserFromLocal,
  getMyLetters,
  type User,
  type Letter,
} from "@/lib/social-journal";
import { Drawer } from "vaul";
import { useSocialJournalStore } from "@/lib/store/social-journal-store";
import LetterDetailDrawer from "./components/letter-detail-drawer";
import SendLetterDrawer from "./components/send-letter-drawer";
import { triggerSplineObjectWithRetry, triggerSplineObject, SPLINE_OBJECTS } from "@/lib/spline-utils";

export default function SocialJournalPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [letters, setLetters] = useState<Letter[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 使用 Zustand store 控制社交日记状态
  const { isOpen, setOpen, openLetterDetail, openSendLetter } =
    useSocialJournalStore();

  useEffect(() => {
    // 检查用户登录状态
    const user = getUserFromLocal();
    if (!user) {
      router.push("/social-journal/login");
      return;
    }

    setCurrentUser(user);
    loadLetters(user.invite_code);

    // 添加刷新信件列表的事件监听器
    const handleRefreshLetters = () => {
      if (user) {
        loadLetters(user.invite_code);
      }
    };

    window.addEventListener("refreshLetters", handleRefreshLetters);

    return () => {
      window.removeEventListener("refreshLetters", handleRefreshLetters);
    };
  }, [router]);

  // 页面挂载时自动触发 Spline 动画
  useEffect(() => {
    triggerSplineObjectWithRetry(SPLINE_OBJECTS.MAIL_TO_HOUSE_ANIMATION);
  }, []);

  const loadLetters = async (inviteCode: string) => {
    setIsLoading(true);
    try {
      const userLetters = await getMyLetters(inviteCode);
      setLetters(userLetters);
    } catch (error) {
      console.error("Error loading letters:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLetterClick = (letterId: string) => {
    openLetterDetail(letterId);
  };

  const handleSendNew = () => {
    openSendLetter();
  };

  if (!currentUser) {
    return null; // 重定向中
  }

  return (
    <div className="min-h-screen bg-transparent flex flex-col items-center justify-center py-8 px-2 pointer-events-none">
      <Drawer.Root
        open={isOpen}
        onOpenChange={(open) => {
          setOpen(open);
          if (!open) {
            triggerSplineObject(SPLINE_OBJECTS.JOURNAL_CLOSE);
          }
        }}
      >
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-transparent" />
          <Drawer.Content className="bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl flex flex-col rounded-t-[10px] h-full mt-20 max-h-[96%] fixed bottom-0 left-0 right-0">
            <div className="p-6 flex-1">
              <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-white/30 mb-6" />
              <Drawer.Title className="sr-only">社交日记</Drawer.Title>

              <div className="w-full max-w-2xl mx-auto">
                {/* 用户信息 */}
                <div className="mb-6 text-center">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    社交日记
                  </h1>
                  <p className="text-sm text-gray-700">
                    你好, {currentUser.name} (#{currentUser.invite_code})
                  </p>
                </div>

                {/* 发送新问题按钮 */}
                <div className="mb-6">
                  <Button
                    onClick={handleSendNew}
                    className="w-full bg-blue-600/80 backdrop-blur-sm hover:bg-blue-700/80 text-white py-3 border border-blue-400/30"
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
                    <div className="max-h-[calc(60vh-200px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400/50 scrollbar-track-transparent hover:scrollbar-thumb-gray-400/70 pr-2 -mr-2">
                      <div className="space-y-3 pb-4">
                        {letters.map((letter) => (
                          <div
                            key={letter.id}
                            onClick={() => handleLetterClick(letter.id)}
                          >
                            <Envelope
                              letter={letter}
                              currentUser={currentUser}
                              onClick={() => handleLetterClick(letter.id)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 页脚说明 */}
                <div className="mt-8 text-center">
                  <p className="text-xs text-gray-600">
                    与朋友分享你的邀请码 #{currentUser.invite_code}
                    <br />
                    他们就可以发送问题给你了
                  </p>
                </div>
              </div>

              {/* 信件详情嵌套 Drawer */}
              <LetterDetailDrawer />

              {/* 发信嵌套 Drawer */}
              <SendLetterDrawer />
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  );
}
