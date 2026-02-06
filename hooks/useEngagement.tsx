// src/hooks/useEngagement.ts
// Tracks user engagement and triggers email capture at the right moment

'use client';

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';

interface EngagementState {
  pageViews: number;
  profilesViewed: number;
  timeOnSite: number; // seconds
  interactions: number; // clicks on interactive elements
  hasSubscribed: boolean;
  hasAccount: boolean;
  lastVisit: string;
  sessionStart: number;
}

interface EngagementConfig {
  pageViewThreshold: number; // Show popup after X page views
  profileViewThreshold: number; // Show popup after viewing X profiles
  timeThreshold: number; // Show popup after X seconds
  interactionThreshold: number; // Show popup after X interactions
}

const DEFAULT_CONFIG: EngagementConfig = {
  pageViewThreshold: 5,
  profileViewThreshold: 3,
  timeThreshold: 180, // 3 minutes
  interactionThreshold: 4,
};

const STORAGE_KEY = 'lamma_engagement';

// Helper to get initial state from localStorage (runs during state initialization)
function getInitialState(): EngagementState {
  const defaultState: EngagementState = {
    pageViews: 0,
    profilesViewed: 0,
    timeOnSite: 0,
    interactions: 0,
    hasSubscribed: false,
    hasAccount: false,
    lastVisit: new Date().toISOString(),
    sessionStart: Date.now(),
  };

  if (typeof window === 'undefined') {
    return defaultState;
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return {
        ...parsed,
        sessionStart: Date.now(),
      };
    } catch {
      return defaultState;
    }
  }
  return defaultState;
}

export function useEngagement(config: Partial<EngagementConfig> = {}) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  // Use lazy initializer to read from localStorage
  const [state, setState] = useState<EngagementState>(getInitialState);

  const [dismissed, setDismissed] = useState(false);
  const [initialized, setInitialized] = useState(() => typeof window !== 'undefined');
  const [actionRequested, setActionRequested] = useState(false);

  // Derive shouldShowCapture from state instead of using effect
  const thresholdsMet = state.pageViews >= finalConfig.pageViewThreshold ||
    state.profilesViewed >= finalConfig.profileViewThreshold ||
    state.timeOnSite >= finalConfig.timeThreshold ||
    state.interactions >= finalConfig.interactionThreshold;

  const shouldShowCapture = !state.hasSubscribed &&
    !state.hasAccount &&
    !dismissed &&
    (thresholdsMet || actionRequested);

  // Derive the captureType based on current state
  // If actionRequested is true (user tried an action), show 'action' type, otherwise 'passive'
  const captureType: 'passive' | 'action' = actionRequested ? 'action' : 'passive';

  // Save state to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && initialized) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state, initialized]);

  // Track time on site
  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => ({
        ...prev,
        timeOnSite: prev.timeOnSite + 10,
      }));
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  // Track page view
  const trackPageView = useCallback(() => {
    setState(prev => ({
      ...prev,
      pageViews: prev.pageViews + 1,
    }));
  }, []);

  // Track profile view
  const trackProfileView = useCallback((creatorId: string) => {
    setState(prev => ({
      ...prev,
      profilesViewed: prev.profilesViewed + 1,
    }));
  }, []);

  // Track interaction (button click, etc.)
  const trackInteraction = useCallback((type: string) => {
    setState(prev => ({
      ...prev,
      interactions: prev.interactions + 1,
    }));
  }, []);

  // Track action that requires capture (follow, save, etc.)
  const trackAction = useCallback((action: 'follow' | 'save' | 'like' | 'collection') => {
    if (!state.hasSubscribed && !state.hasAccount) {
      setActionRequested(true);
      // captureType will be derived as 'action' when actionRequested is true
      return false; // Action blocked, show capture
    }
    return true; // Action allowed
  }, [state.hasSubscribed, state.hasAccount]);

  // Mark as subscribed (email captured)
  const markSubscribed = useCallback((email: string) => {
    setState(prev => ({
      ...prev,
      hasSubscribed: true,
    }));
    setActionRequested(false);

    // Store email for later account creation
    if (typeof window !== 'undefined') {
      localStorage.setItem('lamma_pending_email', email);
    }
  }, []);

  // Mark as having account
  const markHasAccount = useCallback(() => {
    setState(prev => ({
      ...prev,
      hasAccount: true,
    }));
    setActionRequested(false);
  }, []);

  // Dismiss popup for this session
  const dismissCapture = useCallback(() => {
    setDismissed(true);
    setActionRequested(false);
  }, []);

  // Reset engagement (for testing)
  const resetEngagement = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('lamma_pending_email');
    }
    setState({
      pageViews: 0,
      profilesViewed: 0,
      timeOnSite: 0,
      interactions: 0,
      hasSubscribed: false,
      hasAccount: false,
      lastVisit: new Date().toISOString(),
      sessionStart: Date.now(),
    });
    setDismissed(false);
  }, []);

  return {
    // State
    state,
    shouldShowCapture,
    captureType,
    initialized,

    // Tracking functions
    trackPageView,
    trackProfileView,
    trackInteraction,
    trackAction,

    // Actions
    markSubscribed,
    markHasAccount,
    dismissCapture,
    resetEngagement,
  };
}

// ============================================
// ENGAGEMENT CONTEXT (for app-wide access)
// ============================================

type EngagementContextType = ReturnType<typeof useEngagement>;

const EngagementContext = createContext<EngagementContextType | null>(null);

export function EngagementProvider({ children }: { children: ReactNode }) {
  const engagement = useEngagement();
  
  return (
    <EngagementContext.Provider value={engagement}>
      {children}
    </EngagementContext.Provider>
  );
}

export function useEngagementContext() {
  const context = useContext(EngagementContext);
  if (!context) {
    throw new Error('useEngagementContext must be used within EngagementProvider');
  }
  return context;
}
