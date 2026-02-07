'use client';

import { useCallback } from 'react';
import { posthog } from '@/lib/posthog';

export function useTrack() {
  const track = useCallback((event: string, properties?: Record<string, any>) => {
    if (posthog && typeof posthog.capture === 'function') {
      posthog.capture(event, properties || {});
    }
  }, []);

  return { track };
}
