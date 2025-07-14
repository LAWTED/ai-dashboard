"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Send, Mail, Clock, User, AlertCircle } from "lucide-react";
import {
  getLetter,
  answerLetter,
  getUserFromLocal,
  type Letter,
} from "@/lib/social-journal";
import { Drawer } from "vaul";
import { useSocialJournalStore } from "@/lib/store/social-journal-store";
import { useTranslation } from "@/lib/i18n/social-journal";

export default function LetterDetailDrawer() {
  const { t, lang } = useTranslation();
  const {
    letterDetailOpen,
    selectedLetterId,
    setLetterDetailOpen,
    closeLetterDetail,
  } = useSocialJournalStore();

  const [letter, setLetter] = useState<Letter | null>(null);
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [currentUser] = useState(getUserFromLocal());

  const loadLetter = useCallback(async () => {
    if (!currentUser || !selectedLetterId) return;

    setIsLoading(true);
    setError("");
    try {
      const letterData = await getLetter(selectedLetterId);
      if (!letterData) {
        setError(t('letterNotFound'));
        return;
      }

      // 检查权限：只有发送者和接收者可以查看
      if (
        letterData.sender_code !== currentUser.invite_code &&
        letterData.receiver_code !== currentUser.invite_code
      ) {
        setError(t('noPermission'));
        return;
      }

      setLetter(letterData);
    } catch (e) {
      console.error("Error loading letter:", e);
      setError(t('loadError'));
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, selectedLetterId, t]);

  useEffect(() => {
    if (letterDetailOpen && selectedLetterId && currentUser) {
      loadLetter();
    }
  }, [letterDetailOpen, selectedLetterId, currentUser, loadLetter]);

  const handleSubmitAnswer = async () => {
    if (!answer.trim() || !selectedLetterId) {
      setError(t('answerRequired'));
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const success = await answerLetter(selectedLetterId, answer.trim());

      if (success) {
        setSuccess(true);
        // 重新加载信件以显示更新后的状态
        await loadLetter();
        setTimeout(() => {
          closeLetterDetail();
          setSuccess(false);
          setAnswer("");
        }, 2000);
      } else {
        setError(t('submitFailed'));
      }
    } catch (e) {
      console.error("Error submitting answer:", e);
      setError(t('submitFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentUser) return null;

  const isReceived = letter && letter.receiver_code === currentUser.invite_code;
  const isSent = letter && letter.sender_code === currentUser.invite_code;
  const isAnswered = letter && letter.status === "answered";
  const canAnswer = isReceived && !isAnswered;

  if (!letterDetailOpen) return null;

  return (
    <Drawer.NestedRoot
      open={letterDetailOpen}
      onOpenChange={setLetterDetailOpen}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-transparent" />
        <Drawer.Content className="bg-white backdrop-blur-md border border-white/20 shadow-2xl flex flex-col rounded-t-[10px] h-full mt-24 max-h-[94%] fixed bottom-0 left-0 right-0">
          <div className="p-6 flex-1 max-h-[85vh] overflow-y-auto">
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-white/30 mb-6" />
            <Drawer.Title className="sr-only">{t('letterDetails')}</Drawer.Title>

            <div className="w-full max-w-2xl mx-auto">
              {/* 头部 */}
              <div className="flex items-center mb-6">
                <h1 className="text-xl font-bold text-gray-900">
                  {isReceived ? t('receivedQuestion') : t('sentQuestion')}
                </h1>
              </div>

              {isLoading && (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">{t('loading')}</p>
                </div>
              )}

              {error && !letter && (
                <div className="text-center py-8">
                  <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    {t('loadError')}
                  </h2>
                  <p className="text-gray-600 mb-4">{error}</p>
                  <Button
                    onClick={closeLetterDetail}
                    className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-gray-900 border border-white/30"
                  >
                    {t('back')}
                  </Button>
                </div>
              )}

              {success && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-green-500/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <Mail className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    {t('answerSuccessMessage')}
                  </h2>
                  <p className="text-gray-600 mb-4">
                    {t('answerSentTo')} #{letter?.sender_code}
                  </p>
                  <p className="text-sm text-gray-500">{t('closingSoon')}</p>
                </div>
              )}

              {letter && !success && (
                <div className="space-y-6">
                  {/* 信件信息 */}
                  <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <Mail className="w-5 h-5 mr-2 text-blue-600" />
                        <span className="text-lg font-medium text-gray-900">
                          {t('letterDetailsTitle')}
                        </span>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          isAnswered
                            ? "bg-green-500/20 text-green-800 backdrop-blur-sm"
                            : "bg-yellow-500/20 text-yellow-800 backdrop-blur-sm"
                        }`}
                      >
                        {isAnswered ? t('answered') : t('pending')}
                      </span>
                    </div>

                    {/* 发送者/接收者信息 */}
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        <span>
                          {isReceived
                            ? `${t('senderLabel')}: #${letter.sender_code}`
                            : `${t('recipientLabel')}: #${letter.receiver_code}`}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>
                          {new Date(letter.created_at).toLocaleDateString(
                            lang === 'zh' ? "zh-CN" : "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </span>
                      </div>
                    </div>

                    {/* 问题内容 */}
                    <div className="bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 rounded-lg p-4">
                      <h3 className="font-medium text-blue-900 mb-2">{t('questionLabel')}</h3>
                      <p className="text-blue-800 leading-relaxed">
                        {letter.question}
                      </p>
                    </div>
                  </div>

                  {/* 回答部分 */}
                  {isAnswered && letter.answer && (
                    <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-lg font-medium text-green-700">
                          {t('answerLabel')}
                        </span>
                        {letter.answered_at && (
                          <p className="text-sm text-gray-500 flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {t('answeredAt')}{" "}
                            {new Date(letter.answered_at).toLocaleDateString(
                              lang === 'zh' ? "zh-CN" : "en-US",
                              {
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </p>
                        )}
                      </div>
                      <div className="bg-green-500/20 backdrop-blur-sm border border-green-400/30 rounded-lg p-4">
                        <p className="text-green-800 leading-relaxed">
                          {letter.answer}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* 回答输入框（仅收到的未回答问题显示） */}
                  {canAnswer && (
                    <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-4">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        {t('enterYourAnswer')}
                      </h3>
                      <div className="space-y-4">
                        <Textarea
                          placeholder={t('pleaseEnterAnswer')}
                          value={answer}
                          onChange={(e) => setAnswer(e.target.value)}
                          rows={4}
                          maxLength={500}
                          className="resize-none bg-white/30 backdrop-blur-sm border-white/40 text-gray-900 placeholder:text-gray-600"
                        />
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-500">
                            {answer.length}/500 {t('characters')}
                          </p>
                        </div>

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

                        <Button
                          onClick={handleSubmitAnswer}
                          disabled={isSubmitting || !answer.trim()}
                          className="w-full bg-green-600/80 backdrop-blur-sm hover:bg-green-700/80 text-white border border-green-400/30"
                          size="lg"
                        >
                          {isSubmitting ? (
                            t('submitting')
                          ) : (
                            <>
                              <Send className="w-5 h-5 mr-2" />
                              {t('submitAnswer')}
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* 状态说明 */}
                  {isSent && !isAnswered && (
                    <div className="bg-yellow-500/20 backdrop-blur-sm border border-yellow-400/30 rounded-2xl p-4">
                      <p className="text-sm text-yellow-800 text-center">
                        {t('questionSentWaitingReply')}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.NestedRoot>
  );
}
