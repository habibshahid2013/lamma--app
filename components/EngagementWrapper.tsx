// src/components/EngagementWrapper.tsx
// Wraps the app to track engagement and show email capture popup

'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { EngagementProvider, useEngagementContext } from '@/hooks/useEngagement';
import { useAuth } from '@/contexts/AuthContext';
import EmailCaptureModal from './EmailCaptureModal';

// Inner component that uses the context
function EngagementTracker({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { 
    trackPageView, 
    trackProfileView, 
    markHasAccount,
    shouldShowCapture 
  } = useEngagementContext();

  // Mark as having account when user logs in
  useEffect(() => {
    if (user) {
      markHasAccount();
    }
  }, [user, markHasAccount]);

  // Track page views
  useEffect(() => {
    trackPageView();
    
    // Track profile views specifically
    if (pathname?.startsWith('/creator/')) {
      const creatorId = pathname.split('/')[2];
      if (creatorId) {
        trackProfileView(creatorId);
      }
    }
  }, [pathname, trackPageView, trackProfileView]);

  return (
    <>
      {children}
      {/* Global email capture modal */}
      {shouldShowCapture && <EmailCaptureModal />}
    </>
  );
}

// Main wrapper with provider
export default function EngagementWrapper({ children }: { children: React.ReactNode }) {
  return (
    <EngagementProvider>
      <EngagementTracker>
        {children}
      </EngagementTracker>
    </EngagementProvider>
  );
}
