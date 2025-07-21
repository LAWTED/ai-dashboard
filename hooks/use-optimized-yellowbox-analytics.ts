"use client";

import { useRef, useState, useCallback } from 'react';
import { MinimalYellowBoxAnalytics, WritingSegment } from '@/types/yellowbox-analytics';

export function useOptimizedYellowboxAnalytics(sessionId: string, userId?: string) {
  const [analytics, setAnalytics] = useState<MinimalYellowBoxAnalytics>(() => ({
    sessionId,
    userId: userId || '',
    sessionStart: new Date().toISOString(),
    finalCharacterCount: 0,
    finalWordCount: 0,
    writingSegments: [],
    selectedFont: 'serif',
    voiceUsed: false,
    language: typeof window !== 'undefined' ? window.navigator.language : 'en',
    errorOccurred: false,
    analyticsConsent: true
  }));

  // Tracking refs for WritingSegment recording
  const currentSegment = useRef<WritingSegment | null>(null);
  const isWriting = useRef<boolean>(false);
  const lastKeystroke = useRef<number>(0);

  // Start a new writing segment
  const startWritingSegment = useCallback(() => {
    if (!analytics.analyticsConsent || isWriting.current) return;
    
    const now = new Date().toISOString();
    currentSegment.current = {
      startTime: now,
      endTime: '',
      duration: 0,
      content: ''
    };
    isWriting.current = true;
    lastKeystroke.current = Date.now();
  }, [analytics.analyticsConsent]);

  // End current writing segment and save it
  const endWritingSegment = useCallback((finalContent: string) => {
    if (!analytics.analyticsConsent || !currentSegment.current || !isWriting.current) return;

    const now = new Date().toISOString();
    const nowMs = Date.now();
    const startMs = new Date(currentSegment.current.startTime).getTime();
    
    // Only save segment if it has meaningful content or duration
    if (finalContent.trim().length > 0 || (nowMs - startMs) > 1000) {
      const completedSegment: WritingSegment = {
        ...currentSegment.current,
        endTime: now,
        duration: nowMs - startMs,
        content: finalContent
      };

      setAnalytics(prev => ({
        ...prev,
        writingSegments: [...prev.writingSegments, completedSegment]
      }));
    }

    currentSegment.current = null;
    isWriting.current = false;
  }, [analytics.analyticsConsent]);

  // Track keystroke and manage writing segments
  const trackKeystroke = useCallback((event: KeyboardEvent, textLength: number) => {
    if (!analytics.analyticsConsent) return;

    const now = Date.now();
    
    // Check if we should start a new writing segment
    if (!isWriting.current && event.type === 'keydown' && 
        (event.key.length === 1 || ['Backspace', 'Delete', 'Enter', 'Space'].includes(event.key))) {
      startWritingSegment();
    }
    
    // Check for writing pause (3+ seconds since last keystroke)
    if (isWriting.current && lastKeystroke.current > 0 && now - lastKeystroke.current > 3000) {
      // End current segment if there's been a significant pause
      if (currentSegment.current) {
        endWritingSegment(currentSegment.current.content);
      }
      // Don't start new segment immediately - wait for next keystroke
    }

    lastKeystroke.current = now;
  }, [analytics.analyticsConsent, startWritingSegment, endWritingSegment]);

  // Track text changes and update current segment content
  const trackTextChange = useCallback((newText: string, oldText: string) => {
    if (!analytics.analyticsConsent) return;

    // Update current writing segment content
    if (isWriting.current && currentSegment.current) {
      currentSegment.current.content = newText;
    }

    // Update final metrics
    const words = newText.trim().split(/\s+/).filter(word => word.length > 0);
    
    setAnalytics(prev => ({
      ...prev,
      finalCharacterCount: newText.length,
      finalWordCount: words.length
    }));
  }, [analytics.analyticsConsent]);

  // Track font selection
  const trackFontChange = useCallback((font: 'serif' | 'sans' | 'mono') => {
    if (!analytics.analyticsConsent) return;

    setAnalytics(prev => ({
      ...prev,
      selectedFont: font
    }));
  }, [analytics.analyticsConsent]);

  // Track voice usage
  const trackVoiceUsage = useCallback(() => {
    if (!analytics.analyticsConsent) return;

    setAnalytics(prev => ({
      ...prev,
      voiceUsed: true
    }));
  }, [analytics.analyticsConsent]);

  // Track errors
  const trackError = useCallback(() => {
    if (!analytics.analyticsConsent) return;

    setAnalytics(prev => ({
      ...prev,
      errorOccurred: true
    }));
  }, [analytics.analyticsConsent]);

  // Force end current writing segment (e.g., when user submits)
  const forceEndCurrentSegment = useCallback((finalContent?: string) => {
    if (isWriting.current && currentSegment.current) {
      const contentToUse = finalContent || currentSegment.current.content;
      endWritingSegment(contentToUse);
    }
  }, [endWritingSegment]);

  // Finalize session
  const finalizeSession = useCallback(() => {
    const now = new Date().toISOString();
    
    // End current writing segment if still active
    forceEndCurrentSegment();
    
    setAnalytics(prev => ({
      ...prev,
      sessionEnd: now
    }));
  }, [forceEndCurrentSegment]);

  return {
    analytics,
    trackKeystroke,
    trackTextChange,
    trackFontChange,
    trackVoiceUsage,
    trackError,
    forceEndCurrentSegment,
    finalizeSession,
    setAnalyticsConsent: (consent: boolean) => 
      setAnalytics(prev => ({ ...prev, analyticsConsent: consent }))
  };
}