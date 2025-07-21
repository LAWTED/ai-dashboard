"use client";

import { useRef, useState, useCallback, useEffect } from 'react';
import { 
  YellowBoxAnalytics, 
  TypingPattern, 
  EditingBehavior, 
  SessionTiming, 
  UserInteractions, 
  ContentAnalysis,
  PerformanceMetrics 
} from '@/types/yellowbox-analytics';

export function useYellowboxAnalytics(sessionId: string, userId?: string) {
  const [analytics, setAnalytics] = useState<YellowBoxAnalytics>(() => {
    // Collect device information
    const deviceInfo = typeof window !== 'undefined' ? {
      userAgent: window.navigator.userAgent,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      isMobile: /Mobile|Android|iPhone|iPad/.test(window.navigator.userAgent),
      browserLanguage: window.navigator.language
    } : undefined;

    return {
    sessionId,
    userId: userId || '',
    typingPatterns: [],
    editingBehavior: {
      totalBackspaces: 0,
      totalCharactersDeleted: 0,
      revisionCount: 0,
      pasteCount: 0,
      textChanges: []
    },
    sessionTiming: {
      sessionStart: new Date().toISOString(),
      activeWritingTime: 0,
      pauseDurations: [],
      longestPause: 0
    },
    userInteractions: {
      voiceButtonClicks: 0,
      voiceInputUsage: 0,
      fontSwitches: [],
      languageSwitches: [],
      resetButtonClicks: 0,
      submitAttempts: 0
    },
    contentAnalysis: {
      characterCount: 0,
      wordCount: 0,
      sentenceCount: 0,
      averageWordsPerSentence: 0,
      writingSpeed: 0
    },
    performance: {
      apiResponseTimes: [],
      errorCounts: {
        transcriptionErrors: 0,
        aiResponseErrors: 0,
        savingErrors: 0,
        networkErrors: 0
      },
      loadTimes: {
        pageLoad: Date.now(),
        firstInteraction: 0
      }
    },
    deviceInfo,
    analyticsConsent: true,
    anonymized: false
  };
  });

  const lastKeystroke = useRef<number>(0);
  const writingStartTime = useRef<number>(0);
  const isWriting = useRef<boolean>(false);
  const pauseStartTime = useRef<number>(0);

  // Track typing patterns
  const trackKeystroke = useCallback((event: KeyboardEvent, textLength: number) => {
    if (!analytics.analyticsConsent) return;

    const now = Date.now();
    const pattern: TypingPattern = {
      timestamp: now,
      keyCode: event.code,
      action: event.type as 'keydown' | 'keyup',
      textLength,
      isBackspace: event.key === 'Backspace'
    };

    setAnalytics(prev => ({
      ...prev,
      typingPatterns: [...prev.typingPatterns.slice(-50), pattern] // Keep last 50 keystrokes
    }));

    // Track writing session timing
    if (event.type === 'keydown') {
      if (!isWriting.current) {
        writingStartTime.current = now;
        isWriting.current = true;
        
        // Record pause if there was one
        if (pauseStartTime.current > 0) {
          const pauseDuration = now - pauseStartTime.current;
          setAnalytics(prev => ({
            ...prev,
            sessionTiming: {
              ...prev.sessionTiming,
              pauseDurations: [...prev.sessionTiming.pauseDurations, pauseDuration],
              longestPause: Math.max(prev.sessionTiming.longestPause, pauseDuration)
            }
          }));
        }
        
        // Set first interaction time
        setAnalytics(prev => ({
          ...prev,
          performance: {
            ...prev.performance,
            loadTimes: {
              ...prev.performance.loadTimes,
              firstInteraction: prev.performance.loadTimes.firstInteraction || now
            }
          }
        }));
      }
      lastKeystroke.current = now;
    }

    // Track backspaces
    if (event.key === 'Backspace') {
      setAnalytics(prev => ({
        ...prev,
        editingBehavior: {
          ...prev.editingBehavior,
          totalBackspaces: prev.editingBehavior.totalBackspaces + 1
        }
      }));
    }
  }, [analytics.analyticsConsent]);

  // Track text changes
  const trackTextChange = useCallback((newText: string, oldText: string) => {
    if (!analytics.analyticsConsent) return;

    const now = Date.now();
    
    // Determine change type
    let action: 'insert' | 'delete' | 'paste' = 'insert';
    if (newText.length < oldText.length) {
      action = 'delete';
    } else if (newText.length - oldText.length > 1) {
      action = 'paste';
    }

    const change = {
      timestamp: now,
      action,
      position: newText.length,
      text: action === 'delete' ? oldText.slice(newText.length) : newText.slice(oldText.length)
    };

    setAnalytics(prev => ({
      ...prev,
      editingBehavior: {
        ...prev.editingBehavior,
        textChanges: [...prev.editingBehavior.textChanges.slice(-20), change], // Keep last 20 changes
        pasteCount: action === 'paste' ? prev.editingBehavior.pasteCount + 1 : prev.editingBehavior.pasteCount,
        revisionCount: prev.editingBehavior.revisionCount + 1
      }
    }));

    // Update content analysis
    const words = newText.trim().split(/\s+/).filter(word => word.length > 0);
    const sentences = newText.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    setAnalytics(prev => ({
      ...prev,
      contentAnalysis: {
        ...prev.contentAnalysis,
        characterCount: newText.length,
        wordCount: words.length,
        sentenceCount: sentences.length,
        averageWordsPerSentence: sentences.length > 0 ? words.length / sentences.length : 0
      }
    }));
  }, [analytics.analyticsConsent]);

  // Track pauses in writing
  const trackWritingPause = useCallback(() => {
    if (!analytics.analyticsConsent) return;

    const now = Date.now();
    if (isWriting.current && lastKeystroke.current > 0) {
      const timeSinceLastKey = now - lastKeystroke.current;
      
      // If more than 3 seconds since last keystroke, consider it a pause
      if (timeSinceLastKey > 3000) {
        isWriting.current = false;
        pauseStartTime.current = now;
        
        // Update active writing time
        const writingDuration = lastKeystroke.current - writingStartTime.current;
        setAnalytics(prev => ({
          ...prev,
          sessionTiming: {
            ...prev.sessionTiming,
            activeWritingTime: prev.sessionTiming.activeWritingTime + writingDuration
          }
        }));
      }
    }
  }, [analytics.analyticsConsent]);

  // Track user interactions
  const trackInteraction = useCallback((type: keyof UserInteractions, data?: any) => {
    if (!analytics.analyticsConsent) return;

    setAnalytics(prev => {
      const interactions = { ...prev.userInteractions };
      
      switch (type) {
        case 'voiceButtonClicks':
          interactions.voiceButtonClicks += 1;
          break;
        case 'voiceInputUsage':
          interactions.voiceInputUsage += 1;
          break;
        case 'fontSwitches':
          interactions.fontSwitches = [...interactions.fontSwitches, {
            timestamp: Date.now(),
            from: data.from,
            to: data.to
          }];
          break;
        case 'languageSwitches':
          interactions.languageSwitches = [...interactions.languageSwitches, {
            timestamp: Date.now(),
            from: data.from,
            to: data.to
          }];
          break;
        case 'resetButtonClicks':
          interactions.resetButtonClicks += 1;
          break;
        case 'submitAttempts':
          interactions.submitAttempts += 1;
          break;
      }
      
      return { ...prev, userInteractions: interactions };
    });
  }, [analytics.analyticsConsent]);

  // Track API performance
  const trackApiCall = useCallback((endpoint: string, startTime: number, success: boolean) => {
    if (!analytics.analyticsConsent) return;

    const responseTime = Date.now() - startTime;
    
    setAnalytics(prev => ({
      ...prev,
      performance: {
        ...prev.performance,
        apiResponseTimes: [...prev.performance.apiResponseTimes.slice(-10), {
          endpoint,
          responseTime,
          timestamp: Date.now(),
          success
        }]
      }
    }));
  }, [analytics.analyticsConsent]);

  // Track errors
  const trackError = useCallback((errorType: keyof PerformanceMetrics['errorCounts']) => {
    if (!analytics.analyticsConsent) return;

    setAnalytics(prev => ({
      ...prev,
      performance: {
        ...prev.performance,
        errorCounts: {
          ...prev.performance.errorCounts,
          [errorType]: prev.performance.errorCounts[errorType] + 1
        }
      }
    }));
  }, [analytics.analyticsConsent]);

  // Finalize session
  const finalizeSession = useCallback(() => {
    const now = Date.now();
    const sessionStart = new Date(analytics.sessionTiming.sessionStart).getTime();
    
    setAnalytics(prev => ({
      ...prev,
      sessionTiming: {
        ...prev.sessionTiming,
        sessionEnd: new Date().toISOString(),
        totalDuration: now - sessionStart
      }
    }));
  }, [analytics.sessionTiming.sessionStart]);

  // Set up pause tracking interval
  useEffect(() => {
    const interval = setInterval(trackWritingPause, 1000);
    return () => clearInterval(interval);
  }, [trackWritingPause]);

  return {
    analytics,
    trackKeystroke,
    trackTextChange,
    trackInteraction,
    trackApiCall,
    trackError,
    finalizeSession,
    setAnalyticsConsent: (consent: boolean) => 
      setAnalytics(prev => ({ ...prev, analyticsConsent: consent }))
  };
}