'use client';

import { Mail, MailOpen, Send, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Letter, User } from '@/lib/social-journal';
import { useTranslation } from '@/lib/i18n/social-journal';

interface EnvelopeProps {
  letter: Letter;
  currentUser: User;
  onClick?: () => void;
  className?: string;
}

export function Envelope({ letter, currentUser, onClick, className }: EnvelopeProps) {
  const { t } = useTranslation();
  const isReceived = letter.receiver_code === currentUser.invite_code;
  const isSent = letter.sender_code === currentUser.invite_code;
  const isAnswered = letter.status === 'answered';

  // 确定显示的名称
  const displayName = isReceived ? `${t('sender')}: ${letter.sender_code}` : `${t('receiver')}: ${letter.receiver_code}`;

  // 确定信封状态
  const getEnvelopeIcon = () => {
    if (isReceived && !isAnswered) {
      return <Mail className="w-8 h-8 text-red-500" />;
    } else if (isReceived && isAnswered) {
      return <MailOpen className="w-8 h-8 text-green-500" />;
    } else if (isSent && isAnswered) {
      return <MailOpen className="w-8 h-8 text-blue-500" />;
    } else {
      return <Send className="w-8 h-8 text-gray-500" />;
    }
  };

  const getStatusText = () => {
    if (isReceived && !isAnswered) {
      return t('pending');
    } else if (isReceived && isAnswered) {
      return t('answered');
    } else if (isSent && isAnswered) {
      return t('receivedReply');
    } else {
      return t('waitingReply');
    }
  };

  const getStatusColor = () => {
    if (isReceived && !isAnswered) {
      return "text-red-600 bg-red-50";
    } else if (isReceived && isAnswered) {
      return "text-green-600 bg-green-50";
    } else if (isSent && isAnswered) {
      return "text-blue-600 bg-blue-50";
    } else {
      return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer border border-gray-200 p-4",
        className
      )}
    >
      <div className="flex items-start space-x-4">
        {/* 信封图标 */}
        <div className="flex-shrink-0 p-2 bg-gray-50 rounded-lg">
          {getEnvelopeIcon()}
        </div>

        {/* 信件内容 */}
        <div className="flex-1 min-w-0">
          {/* 标题行 */}
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-900 truncate">
              {displayName}
            </p>
            <span className={cn("text-xs px-2 py-1 rounded-full", getStatusColor())}>
              {getStatusText()}
            </span>
          </div>

          {/* 问题预览 */}
          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
            {letter.question}
          </p>

          {/* 时间和状态 */}
          <div className="flex items-center text-xs text-gray-500">
            <Clock className="w-3 h-3 mr-1" />
            <span>
              {new Date(letter.created_at).toLocaleDateString('zh-CN', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface EmptyEnvelopeProps {
  type: 'no-letters' | 'loading';
  className?: string;
}

export function EmptyEnvelope({ type, className }: EmptyEnvelopeProps) {
  const { t } = useTranslation();

  return (
    <div className={cn("text-center py-12", className)}>
      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
        <Mail className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {type === 'loading' ? t('loading') : t('noLetters')}
      </h3>
      <p className="text-gray-500">
        {type === 'loading'
          ? t('loading')
          : t('sendFirstQuestion')
        }
      </p>
    </div>
  );
}