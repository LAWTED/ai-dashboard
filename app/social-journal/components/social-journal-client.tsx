"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Envelope, EmptyEnvelope } from "./envelope";
import {
  getUserFromLocal,
  type User,
} from "@/lib/social-journal";
import { Drawer } from "vaul";
import { useSocialJournalStore } from "@/lib/store/social-journal-store";
import LetterDetailDrawer from "./letter-detail-drawer";
import SendLetterDrawer from "./send-letter-drawer";
import {
  triggerSplineObjectWithRetry,
  triggerSplineObject,
  SPLINE_OBJECTS,
} from "@/lib/spline-utils";
import { useTranslation } from "@/lib/i18n/social-journal";
import { useLettersRealtime } from "@/lib/hooks/use-letters-realtime";

export default function SocialJournalClient() {
  const router = useRouter();
  const { t } = useTranslation();
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // 使用 Realtime Hook 来管理信件
  const { letters, isLoading } = useLettersRealtime(currentUser?.invite_code || null);

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

    // 只有在用户登录后才触发 Spline 动画
    triggerSplineObjectWithRetry(SPLINE_OBJECTS.MAIL_TO_HOUSE_ANIMATION);
  }, [router]);

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
    <div className="min-h-[100dvh] bg-transparent flex flex-col items-center justify-center py-8 px-2 pointer-events-none font-comic-neue">
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
            <div className="p-6 flex-1 overflow-y-auto">
              <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-white/30 mb-6" />
              <Drawer.Title className="sr-only">Social Journal</Drawer.Title>

              <div className="w-full max-w-2xl mx-auto">
                {/* 用户信息和语言切换 */}
                <div className="mb-6 text-center">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {t("appName")}
                  </h1>
                  <p className="text-sm text-gray-700">
                    {t("hello")}, {currentUser.name} (#{currentUser.invite_code}
                    )
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
                    {t("sendNewQuestion")}
                  </Button>
                </div>

                {/* 信件列表 */}
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    {t("myLetters")} ({letters.length})
                    {/* 实时状态指示器 */}
                    <span className="ml-2 inline-flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"
                           title="Real-time updates enabled"
                      />
                    </span>
                  </h2>

                  {isLoading ? (
                    <EmptyEnvelope type="loading" />
                  ) : letters.length === 0 ? (
                    <EmptyEnvelope type="no-letters" />
                  ) : (
                    <div className=" pr-2 -mr-2">
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
                    {t("shareInviteCode")} #{currentUser.invite_code}
                    <br />
                    {t("friendsCanSendQuestions")}
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
