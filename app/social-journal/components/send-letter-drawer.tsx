"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Send, AlertCircle, Mail, Shuffle, RefreshCw } from "lucide-react";
import {
  getRandomQuestionsFromDB,
  sendLetter,
  checkInviteCode,
  getUserFromLocal,
  getRandomUser,
  type User,
} from "@/lib/social-journal";
import { Drawer } from "vaul";
import { useSocialJournalStore } from "@/lib/store/social-journal-store";
import { motion } from "framer-motion";
import { useTranslation } from "@/lib/i18n/social-journal";

export default function SendLetterDrawer() {
  const { t } = useTranslation();
  const { sendLetterOpen, setSendLetterOpen, closeSendLetter } =
    useSocialJournalStore();

  const [selectedQuestion, setSelectedQuestion] = useState("");
  const [friendCode, setFriendCode] = useState("");
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [currentUser] = useState(getUserFromLocal());
  const [isRandomSend, setIsRandomSend] = useState(false);
  const [randomUser, setRandomUser] = useState<User | null>(null);
  const [questions, setQuestions] = useState<string[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Load random questions from database
  useEffect(() => {
    const loadQuestions = async () => {
      setQuestionsLoading(true);
      try {
        const randomQuestions = await getRandomQuestionsFromDB(4);
        setQuestions(randomQuestions);
      } catch (error) {
        console.error("Failed to load questions from database:", error);
        // 如果数据库查询失败，设置为空数组
        setQuestions([]);
      } finally {
        setQuestionsLoading(false);
      }
    };

    if (sendLetterOpen) {
      loadQuestions();
    }
  }, [sendLetterOpen]);

  // 刷新问题列表
  const refreshQuestions = async () => {
    try {
      const randomQuestions = await getRandomQuestionsFromDB(4);
      setQuestions(randomQuestions);
      // 清除当前选中的问题，因为新的问题列表可能不包含之前选中的问题
      setSelectedQuestion("");
    } catch (error) {
      console.error("Failed to refresh questions:", error);
      // 如果数据库查询失败，设置为空数组
      setQuestions([]);
      setSelectedQuestion("");
    }
  };

  // 处理OTP输入
  const handleOtpChange = (index: number, value: string) => {
    const newValue = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (newValue.length <= 1) {
      const newOtpValues = [...otpValues];
      newOtpValues[index] = newValue;
      setOtpValues(newOtpValues);
      setFriendCode(newOtpValues.join(""));

      // 自动跳转到下一个输入框
      if (newValue && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  // 处理退格键
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // 处理粘贴
  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 6);
    const newOtpValues = [...otpValues];

    for (let i = 0; i < 6; i++) {
      newOtpValues[i] = pastedData[i] || "";
    }

    setOtpValues(newOtpValues);
    setFriendCode(newOtpValues.join(""));

    // 聚焦到最后一个有值的输入框或第一个空输入框
    const lastFilledIndex = newOtpValues.findIndex((val) => !val);
    const focusIndex =
      lastFilledIndex === -1 ? 5 : Math.max(0, lastFilledIndex - 1);
    inputRefs.current[focusIndex]?.focus();
  };

  // 处理随机选择用户
  const handleRandomSelect = async () => {
    if (!currentUser) return;

    setIsLoading(true);
    setError("");

    try {
      const user = await getRandomUser(currentUser.invite_code);
      if (user) {
        setRandomUser(user);
        setFriendCode(user.invite_code);

        // 使用动画效果逐个填入邀请码
        const codeArray = user.invite_code.split("");
        setOtpValues(["", "", "", "", "", ""]); // 先清空

        // 逐个填入，每个字符间隔200ms
        for (let i = 0; i < codeArray.length; i++) {
          setTimeout(() => {
            setOtpValues((prev) => {
              const newValues = [...prev];
              newValues[i] = codeArray[i];
              return newValues;
            });
          }, i * 200);
        }
      } else {
        setError(t("noOtherUsersFound"));
      }
    } catch (e) {
      console.error("Error getting random user:", e);
      setError(t("sendFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  // 切换发送模式
  const toggleSendMode = async () => {
    const newIsRandomSend = !isRandomSend;
    setIsRandomSend(newIsRandomSend);
    setRandomUser(null);
    setFriendCode("");
    setOtpValues(["", "", "", "", "", ""]);
    setError("");

    // 如果切换到随机发送模式，自动获取随机用户
    if (newIsRandomSend) {
      await handleRandomSelect();
    }
  };

  const handleSend = async () => {
    setError("");

    if (!currentUser) {
      setError(t("userNotFound"));
      return;
    }

    if (!selectedQuestion) {
      setError(t("questionRequired"));
      return;
    }

    // 如果是随机发送模式，先选择随机用户
    if (isRandomSend && !randomUser) {
      await handleRandomSelect();
      return;
    }

    // 如果是手动输入模式或已经有随机用户，检查邀请码
    const targetCode = isRandomSend ? randomUser?.invite_code : friendCode;

    if (!targetCode || targetCode.length !== 6) {
      if (isRandomSend) {
        setError(t("noOtherUsersFound"));
      } else {
        setError(t("inviteCodeRequired"));
      }
      return;
    }

    if (targetCode === currentUser.invite_code) {
      setError(t("cannotSendToSelf"));
      return;
    }

    setIsLoading(true);

    try {
      // 如果是手动输入模式，检查好友邀请码是否存在
      if (!isRandomSend) {
        const friendExists = await checkInviteCode(targetCode);
        if (!friendExists) {
          setError(t("friendCodeNotFound"));
          setIsLoading(false);
          return;
        }
      }

      // 发送信件
      const success = await sendLetter(
        currentUser.invite_code,
        targetCode,
        selectedQuestion
      );

      if (success) {
        setSuccess(true);
        setTimeout(() => {
          closeSendLetter();
          setSuccess(false);
          setSelectedQuestion("");
          setFriendCode("");
          setOtpValues(["", "", "", "", "", ""]);
          setIsRandomSend(false);
          setRandomUser(null);
        }, 2000);
      } else {
        setError(t("sendFailed"));
      }
    } catch (e) {
      console.error("Send error:", e);
      setError(t("sendFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  if (!sendLetterOpen) return null;

  return (
    <Drawer.NestedRoot open={sendLetterOpen} onOpenChange={setSendLetterOpen}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-transparent" />
        <Drawer.Title className="sr-only">{t("sendQuestion")}</Drawer.Title>
        <Drawer.Content className="bg-white backdrop-blur-md border border-white/20 shadow-2xl flex flex-col rounded-t-[10px] h-full mt-24 max-h-[94%] fixed bottom-0 left-0 right-0">
          <div className="p-6 flex-1 max-h-[85vh] overflow-y-auto">
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-white/30 mb-6" />

            {success ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-500/20 backdrop-blur-sm border border-green-400/30 rounded-full flex items-center justify-center">
                  <Mail className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {t("sendSuccess")}
                </h2>
                <p className="text-gray-600 mb-4">
                  {t("questionSentTo")}{" "}
                  {isRandomSend && randomUser
                    ? `#${randomUser.invite_code}`
                    : `#${friendCode}`}
                </p>
                <p className="text-sm text-gray-500">{t("closingSoon")}</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* 头部 */}
                <div className="flex items-center mb-6">
                  <h1 className="text-xl font-bold text-gray-900">
                    {t("sendQuestion")}
                  </h1>
                </div>

                {/* 选择问题 */}
                <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {t("selectQuestion")}
                    </h3>
                    <Button
                      type="button"
                      onClick={refreshQuestions}
                      disabled={questionsLoading}
                      variant="outline"
                      size="sm"
                      className="bg-white/10 hover:bg-white/20 text-gray-700 border-white/30"
                    >
                      <RefreshCw className="w-4 h-4 mr-1" />
                      {t("refreshQuestions")}
                    </Button>
                  </div>
                  <div className="grid gap-3">
                    {questionsLoading ? (
                      <div className="text-center py-8">
                        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-sm text-gray-600">{t("loading")}</p>
                      </div>
                    ) : (
                      questions.map((question: string, index: number) => (
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
                      ))
                    )}
                  </div>
                </div>

                {/* 发送模式选择 */}
                <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {t("enterFriendCode")}
                  </h3>

                  {/* 模式切换按钮 */}
                  <div className="flex gap-2 mb-4">
                    <Button
                      type="button"
                      onClick={() => toggleSendMode()}
                      variant={!isRandomSend ? "default" : "outline"}
                      size="sm"
                      className={`flex-1 ${
                        !isRandomSend
                          ? "bg-blue-600/80 text-white border-blue-500/30"
                          : "bg-white/10 text-gray-700 border-white/30"
                      }`}
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      {t("friendInviteCode")}
                    </Button>
                    <Button
                      type="button"
                      onClick={() => toggleSendMode()}
                      variant={isRandomSend ? "default" : "outline"}
                      size="sm"
                      className={`flex-1 ${
                        isRandomSend
                          ? "bg-blue-600/80 text-white border-blue-500/30"
                          : "bg-white/10 text-gray-700 border-white/30"
                      }`}
                    >
                      <Shuffle className="w-4 h-4 mr-2" />
                      {t("randomSend")}
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {isRandomSend ? (
                      <>
                        <Label className="text-gray-700">
                          {t("randomSendDesc")}
                        </Label>

                        {/* 随机发送模式下的OTP输入框 */}
                        <div className="flex justify-center gap-2">
                          {otpValues.map((value, index) => (
                            <motion.div
                              key={`random-${index}`}
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: index * 0.1, duration: 0.3 }}
                              whileHover={{ scale: 1.05 }}
                            >
                              <Input
                                type="text"
                                maxLength={1}
                                value={value}
                                readOnly
                                className="w-12 h-12 text-center text-lg font-mono font-bold bg-purple-100/20 backdrop-blur-sm border-purple-300/30 text-purple-800 cursor-default"
                                placeholder=""
                              />
                            </motion.div>
                          ))}
                        </div>

                        <p className="text-xs text-gray-600 text-center">
                          {t("randomSendDesc")}
                        </p>
                      </>
                    ) : (
                      <>
                        <Label htmlFor="friendCode" className="text-gray-700">
                          {t("friendInviteCode")}
                        </Label>

                        {/* OTP 输入框 */}
                        <div
                          className="flex justify-center gap-2"
                          onPaste={handleOtpPaste}
                        >
                          {otpValues.map((value, index) => (
                            <motion.div
                              key={index}
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: index * 0.1, duration: 0.3 }}
                              whileFocus={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Input
                                ref={(el) => {
                                  inputRefs.current[index] = el;
                                }}
                                type="text"
                                maxLength={1}
                                value={value}
                                onChange={(e) =>
                                  handleOtpChange(index, e.target.value)
                                }
                                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                className="w-12 h-12 text-center text-lg font-mono font-bold bg-white/10 backdrop-blur-sm border-white/30 text-gray-800 focus:border-blue-400/50 focus:bg-blue-50/20 transition-all duration-200"
                                placeholder=""
                              />
                            </motion.div>
                          ))}
                        </div>

                        <p className="text-xs text-gray-600 text-center">
                          {t("confirmInviteCode")}
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {/* 预览 */}
                {selectedQuestion &&
                  (isRandomSend ? randomUser : friendCode) && (
                    <div className="bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 rounded-2xl p-4">
                      <h3 className="text-base font-medium text-blue-900 mb-3">
                        {t("sendPreview")}
                      </h3>
                      <div className="space-y-2">
                        <p className="text-sm text-blue-800">
                          <strong>{t("question")}:</strong> {selectedQuestion}
                        </p>
                        <p className="text-sm text-blue-800">
                          <strong>{t("sendTo")}:</strong>{" "}
                          {isRandomSend && randomUser
                            ? `#${randomUser.invite_code}`
                            : `#${friendCode}`}
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
                  disabled={
                    isLoading ||
                    !selectedQuestion ||
                    (isRandomSend ? false : !friendCode)
                  }
                  className="w-full bg-blue-600/80 backdrop-blur-sm hover:bg-blue-700/80 text-white py-3 border border-blue-500/30"
                  size="lg"
                >
                  {isLoading ? (
                    isRandomSend && !randomUser ? (
                      t("sendingToRandom")
                    ) : (
                      t("sending")
                    )
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      {isRandomSend && !randomUser
                        ? t("randomSend")
                        : t("sendQuestion")}
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
