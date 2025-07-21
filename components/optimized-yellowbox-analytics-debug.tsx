"use client";

import { motion } from "framer-motion";
import { MinimalYellowBoxAnalytics } from "@/types/yellowbox-analytics";

interface OptimizedAnalyticsDebugProps {
  analytics: MinimalYellowBoxAnalytics | null;
  language: string;
}

export function OptimizedAnalyticsDebug({ analytics, language }: OptimizedAnalyticsDebugProps) {
  if (!analytics) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-yellow-400 rounded-2xl p-6 mt-6"
      >
        <h2 className="text-2xl font-bold text-[#3B3109] mb-4">
          {language === "zh" ? "📊 极简分析数据" : "📊 Minimal Analytics"}
        </h2>
        <p className="text-[#3B3109]">
          {language === "zh" ? "没有分析数据可显示" : "No analytics data available"}
        </p>
      </motion.div>
    );
  }

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}min`;
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getTotalWritingTime = () => {
    return analytics.writingSegments.reduce((total, segment) => total + segment.duration, 0);
  };

  const getSessionDuration = () => {
    if (!analytics.sessionEnd) return 0;
    return new Date(analytics.sessionEnd).getTime() - new Date(analytics.sessionStart).getTime();
  };

  const getWritingEfficiency = () => {
    const sessionDuration = getSessionDuration();
    const totalWritingTime = getTotalWritingTime();
    if (sessionDuration === 0) return 0;
    return Math.round((totalWritingTime / sessionDuration) * 100);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-yellow-400 rounded-2xl p-6 mt-6 max-h-[600px] overflow-y-auto"
    >
      <h2 className="text-2xl font-bold text-[#3B3109] mb-6">
        {language === "zh" ? "📊 极简写作分析" : "📊 Minimal Writing Analytics"}
        <span className="text-sm font-normal ml-2 text-[#C04635]">
          ({language === "zh" ? "仅12个字段" : "Only 12 fields"})
        </span>
      </h2>

      <div className="space-y-6 text-[#3B3109]">
        {/* Session Overview */}
        <div className="bg-yellow-300 rounded-lg p-4">
          <h3 className="font-bold text-lg mb-3">
            {language === "zh" ? "📝 会话概述" : "📝 Session Overview"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div><strong>{language === "zh" ? "会话ID" : "Session ID"}:</strong> <code className="text-xs">{analytics.sessionId}</code></div>
            <div><strong>{language === "zh" ? "用户ID" : "User ID"}:</strong> <code className="text-xs">{analytics.userId}</code></div>
            <div><strong>{language === "zh" ? "开始时间" : "Start Time"}:</strong> {formatTimestamp(analytics.sessionStart)}</div>
            <div><strong>{language === "zh" ? "结束时间" : "End Time"}:</strong> {analytics.sessionEnd ? formatTimestamp(analytics.sessionEnd) : "N/A"}</div>
            <div><strong>{language === "zh" ? "最终字符数" : "Final Characters"}:</strong> {analytics.finalCharacterCount}</div>
            <div><strong>{language === "zh" ? "最终单词数" : "Final Words"}:</strong> {analytics.finalWordCount}</div>
          </div>
        </div>

        {/* Writing Efficiency */}
        <div className="bg-yellow-300 rounded-lg p-4">
          <h3 className="font-bold text-lg mb-3">
            {language === "zh" ? "⚡ 写作效率" : "⚡ Writing Efficiency"}
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm mb-3">
            <div><strong>{language === "zh" ? "总写作时间" : "Total Writing Time"}:</strong> {formatDuration(getTotalWritingTime())}</div>
            <div><strong>{language === "zh" ? "写作段落数" : "Writing Segments"}:</strong> {analytics.writingSegments.length}</div>
          </div>

          {analytics.sessionEnd && (
            <div className="mt-3 p-3 bg-yellow-200 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-bold">{language === "zh" ? "效率得分" : "Efficiency Score"}:</span>
                <span className="text-2xl font-bold text-[#2AB186]">{getWritingEfficiency()}%</span>
              </div>
              <div className="w-full bg-yellow-100 rounded-full h-2 mt-2">
                <div
                  className="bg-[#2AB186] h-2 rounded-full transition-all duration-500"
                  style={{width: `${getWritingEfficiency()}%`}}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Writing Timeline */}
        {analytics.writingSegments.length > 0 && (
          <div className="bg-yellow-300 rounded-lg p-4">
            <h3 className="font-bold text-lg mb-3">
              {language === "zh" ? "⏱️ 写作时间线" : "⏱️ Writing Timeline"}
            </h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {analytics.writingSegments.map((segment, index) => (
                <div key={index} className="bg-yellow-200 rounded p-3">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-sm">{language === "zh" ? "段落" : "Segment"} {index + 1}</span>
                    <span className="text-xs text-gray-600">{formatDuration(segment.duration)}</span>
                  </div>
                  <div className="text-xs text-gray-700 mb-2">
                    {formatTimestamp(segment.startTime)} → {formatTimestamp(segment.endTime)}
                  </div>
                  <div className="text-sm bg-white rounded p-2 max-h-20 overflow-y-auto">
                    {segment.content || (language === "zh" ? "（空内容）" : "(empty content)")}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* User Preferences & Features */}
        <div className="bg-yellow-300 rounded-lg p-4">
          <h3 className="font-bold text-lg mb-3">
            {language === "zh" ? "🎨 用户偏好与功能" : "🎨 User Preferences & Features"}
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><strong>{language === "zh" ? "选择字体" : "Selected Font"}:</strong>
              <span className="capitalize ml-1">{analytics.selectedFont}</span>
              {analytics.selectedFont === 'serif' ? " 📚" : analytics.selectedFont === 'sans' ? " 🔤" : " 💻"}
            </div>
            <div><strong>{language === "zh" ? "语音使用" : "Voice Used"}:</strong>
              {analytics.voiceUsed ?
                (language === "zh" ? "✅ 是" : "✅ Yes") :
                (language === "zh" ? "❌ 否" : "❌ No")
              }
            </div>
            <div><strong>{language === "zh" ? "语言" : "Language"}:</strong> {analytics.language}</div>
            <div><strong>{language === "zh" ? "发生错误" : "Error Occurred"}:</strong>
              {analytics.errorOccurred ?
                (language === "zh" ? "⚠️ 是" : "⚠️ Yes") :
                (language === "zh" ? "✅ 否" : "✅ No")
              }
            </div>
          </div>
        </div>

        {/* Privacy & Consent */}
        <div className="bg-green-100 border border-green-300 rounded-lg p-4">
          <h3 className="font-bold text-lg mb-3 text-green-800">
            {language === "zh" ? "🔒 隐私与同意" : "🔒 Privacy & Consent"}
          </h3>
          <div className="text-sm text-green-800">
            <div><strong>{language === "zh" ? "分析同意" : "Analytics Consent"}:</strong>
              {analytics.analyticsConsent ?
                (language === "zh" ? "✅ 已同意" : "✅ Granted") :
                (language === "zh" ? "❌ 未同意" : "❌ Denied")
              }
            </div>
          </div>
        </div>


      </div>
    </motion.div>
  );
}