"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut, User, Settings } from "lucide-react";
import { getUserFromLocal } from "@/lib/social-journal";
import { Drawer } from "vaul";
import { useSocialJournalStore } from "@/lib/store/social-journal-store";

export default function LogoutDrawer() {
  const router = useRouter();
  const { logoutOpen, setLogoutOpen, closeLogout } = useSocialJournalStore();
  const [currentUser] = useState(getUserFromLocal());

  const handleLogout = () => {
    // 清除本地存储的用户信息
    if (typeof window !== 'undefined') {
      localStorage.removeItem('social_journal_user');
    }

    // 关闭 drawer 并跳转到登录页
    closeLogout();
    router.push('/social-journal/login');
  };

  if (!logoutOpen) return null;

  return (
    <Drawer.Root open={logoutOpen} onOpenChange={setLogoutOpen}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-transparent" />
        <Drawer.Title className="sr-only">登出</Drawer.Title>
        <Drawer.Content className="bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl flex flex-col rounded-t-[10px] h-auto max-h-[50%] fixed bottom-0 left-0 right-0">
          <div className="p-6">
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-white/30 mb-6" />

            <div className="space-y-6">
              {/* 用户信息 */}
              {currentUser && (
                <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {currentUser.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        邀请码: #{currentUser.invite_code}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 设置选项 */}
              <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-3">设置</h3>
                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-gray-700 hover:bg-white/20 hover:text-gray-900"
                  >
                    <Settings className="w-5 h-5 mr-3" />
                    账户设置
                  </Button>
                </div>
              </div>

              {/* 登出按钮 */}
              <div className="space-y-3">
                <Button
                  onClick={handleLogout}
                  className="w-full bg-red-600/80 backdrop-blur-sm hover:bg-red-700/80 text-white py-3 border border-red-500/30"
                  size="lg"
                >
                  <LogOut className="w-5 h-5 mr-2" />
                  登出账户
                </Button>

                <Button
                  onClick={closeLogout}
                  variant="ghost"
                  className="w-full text-gray-700 hover:bg-white/20 hover:text-gray-900"
                >
                  取消
                </Button>
              </div>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}