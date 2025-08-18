"use client";

import { motion } from "framer-motion";
import { Calendar, FileText, TrendingUp, Heart } from "lucide-react";
import { YellowboxEntry } from "@/lib/api/yellowbox";
import { useYellowBoxI18n } from "@/contexts/yellowbox-i18n-context";

interface StatsCardsProps {
  entries: YellowboxEntry[];
  className?: string;
}

export function StatsCards({ entries, className = "" }: StatsCardsProps) {
  const { t } = useYellowBoxI18n();
  // Helper function to count words in text (supports Chinese and English)
  const countWords = (text: string): number => {
    if (!text || typeof text !== 'string') return 0;
    const trimmed = text.trim();
    if (!trimmed) return 0;
    
    // Count Chinese characters (each Chinese character counts as one word)
    const chineseMatches = trimmed.match(/[\u4e00-\u9fff]/g);
    const chineseCount = chineseMatches ? chineseMatches.length : 0;
    
    // Count English words (split by whitespace, filter out Chinese characters)
    const englishText = trimmed.replace(/[\u4e00-\u9fff]/g, ' ');
    const englishWords = englishText.split(/\s+/).filter(word => 
      word.length > 0 && /[a-zA-Z0-9]/.test(word)
    );
    const englishCount = englishWords.length;
    
    return chineseCount + englishCount;
  };

  // Calculate statistics
  const stats = {
    totalEntries: entries.length,
    totalWords: entries.reduce((total, entry) => {
      if (!entry.entries?.conversationHistory) return total;
      
      const userMessages = entry.entries.conversationHistory.filter(msg => msg.type === "user");
      const entryWordCount = userMessages.reduce((wordCount, msg) => {
        return wordCount + countWords(msg.content);
      }, 0);
      
      return total + entryWordCount;
    }, 0),
    thisWeekEntries: entries.filter(entry => {
      const entryDate = new Date(entry.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return entryDate >= weekAgo;
    }).length,
    mostCommonTimeOfDay: (() => {
      const timeOfDayCount = entries.reduce((acc, entry) => {
        const timeOfDay = entry.entries.timeOfDay;
        acc[timeOfDay] = (acc[timeOfDay] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      return Object.entries(timeOfDayCount).reduce((a, b) => 
        timeOfDayCount[a[0]] > timeOfDayCount[b[0]] ? a : b
      )?.[0] || "daytime";
    })(),
    topValueThemes: (() => {
      const valueCounts = entries.reduce((acc, entry) => {
        if (!entry.metadata?.enhancedSummary?.values) return acc;
        
        entry.metadata.enhancedSummary.values.forEach(value => {
          acc[value] = (acc[value] || 0) + 1;
        });
        return acc;
      }, {} as Record<string, number>);
      
      return Object.entries(valueCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 2)
        .map(([value]) => value);
    })(),
    totalUniqueValues: (() => {
      const allValues = new Set<string>();
      entries.forEach(entry => {
        if (entry.metadata?.enhancedSummary?.values) {
          entry.metadata.enhancedSummary.values.forEach(value => {
            allValues.add(value);
          });
        }
      });
      return allValues.size;
    })(),
    averageWordsPerEntry: entries.length > 0 ? Math.round(
      entries.reduce((total, entry) => {
        if (!entry.entries?.conversationHistory) return total;
        
        const userMessages = entry.entries.conversationHistory.filter(msg => msg.type === "user");
        const entryWordCount = userMessages.reduce((wordCount, msg) => {
          return wordCount + countWords(msg.content);
        }, 0);
        
        return total + entryWordCount;
      }, 0) / entries.length
    ) : 0,
    currentStreak: (() => {
      if (entries.length === 0) return 0;
      
      const sortedEntries = [...entries].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      let streak = 0;
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);
      
      for (const entry of sortedEntries) {
        const entryDate = new Date(entry.created_at);
        entryDate.setHours(0, 0, 0, 0);
        
        const daysDiff = Math.floor((currentDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === streak) {
          streak++;
        } else if (daysDiff === streak + 1) {
          // Allow for today not having an entry yet
          continue;
        } else {
          break;
        }
      }
      
      return streak;
    })()
  };


  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1] as const
      }
    })
  };

  const statsCards = [
    {
      title: t("thisWeek"),
      value: stats.thisWeekEntries,
      subtitle: `${stats.thisWeekEntries} ${stats.thisWeekEntries === 1 ? t("entry") : t("entries")}`,
      icon: Calendar,
      color: "text-green-600"
    },
    {
      title: t("totalWords"),
      value: stats.totalWords.toLocaleString(),
      subtitle: `~${Math.ceil(stats.totalWords / 200)} ${t("minRead")}`,
      icon: FileText,
      color: "text-blue-600"
    },
    {
      title: t("writingStreak"),
      value: stats.currentStreak,
      subtitle: `${stats.currentStreak} ${stats.currentStreak === 1 ? t("day") : t("days")} ${t("inARow")}`,
      icon: TrendingUp,
      color: "text-purple-600"
    },
    {
      title: t("uniqueValues"),
      value: stats.totalUniqueValues,
      subtitle: `${stats.totalUniqueValues} ${stats.totalUniqueValues === 1 ? t("uniqueValue") : t("uniqueValues")} ${t("discovered")}`,
      icon: Heart,
      color: "text-rose-600"
    }
  ];

  if (entries.length === 0) {
    return null;
  }

  return (
    <div className={`grid grid-cols-2 gap-3 mb-6 ${className}`}>
      {statsCards.map((card, index) => (
        <motion.div
          key={Array.isArray(card.title) ? card.title.join('') : card.title}
          custom={index}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          className="bg-yellow-300 rounded-lg p-3 border border-[#E4BE10]"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-xs text-[#3B3109] opacity-75 mb-1">
                {Array.isArray(card.title) ? card.title.join('') : card.title}
              </div>
              <div className="text-lg font-bold text-[#3B3109] mb-1">
                {card.value}
              </div>
              <div className="text-xs text-[#3B3109] opacity-60">
                {Array.isArray(card.subtitle) ? card.subtitle.join('') : card.subtitle}
              </div>
            </div>
            <card.icon className={`w-5 h-5 ${card.color} opacity-60`} />
          </div>
        </motion.div>
      ))}
    </div>
  );
}