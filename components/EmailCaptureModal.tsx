// src/components/EmailCaptureModal.tsx
// Beautiful email capture popup that appears based on engagement

'use client';

import { useState } from 'react';
import { useEngagementContext } from '@/hooks/useEngagement';

interface EmailCaptureModalProps {
  onClose?: () => void;
}

export default function EmailCaptureModal({ onClose }: EmailCaptureModalProps) {
  const { 
    shouldShowCapture, 
    captureType, 
    dismissCapture, 
    markSubscribed 
  } = useEngagementContext();
  
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!shouldShowCapture) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Save email to Firestore
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Failed to subscribe');
      }

      markSubscribed(email);
      setSuccess(true);
      
      // Auto-close after success
      setTimeout(() => {
        onClose?.();
      }, 2000);

    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    dismissCapture();
    onClose?.();
  };

  // Different messaging based on trigger type
  const isActionTrigger = captureType === 'action';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-teal-600 to-emerald-600 px-6 py-8 text-white text-center">
          <div className="text-4xl mb-3">🌙</div>
          <h2 className="text-2xl font-bold mb-2">
            {isActionTrigger 
              ? "Join to Follow Scholars" 
              : "Stay Connected"}
          </h2>
          <p className="text-teal-100 text-sm">
            {isActionTrigger
              ? "Enter your email to follow your favorite scholars and get updates"
              : "Get weekly updates on new content from Islamic scholars"}
          </p>
        </div>

        {/* Body */}
        <div className="p-6">
          {success ? (
            <div className="text-center py-4">
              <div className="text-5xl mb-4">✅</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">You are In!</h3>
              <p className="text-gray-600">Check your inbox for a welcome email.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
                  disabled={loading}
                />
                {error && (
                  <p className="text-red-500 text-sm mt-2">{error}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Subscribing...
                  </span>
                ) : (
                  isActionTrigger ? "Continue" : "Subscribe"
                )}
              </button>
            </form>
          )}

          {/* Sign up link */}
          {!success && (
            <div className="mt-4 text-center">
              <p className="text-gray-500 text-sm">
                Want full access?{' '}
                <a href="/auth/signup" className="text-teal-600 hover:underline font-medium">
                  Create an account
                </a>
              </p>
            </div>
          )}

          {/* Benefits */}
          {!success && (
            <div className="mt-6 pt-6 border-t">
              <p className="text-xs text-gray-500 text-center mb-3">What you will get:</p>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <span className="text-teal-500">✓</span> Weekly content updates
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-teal-500">✓</span> New scholar alerts
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-teal-500">✓</span> Event notifications
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-teal-500">✓</span> Exclusive content
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer note */}
        <div className="px-6 pb-4 text-center">
          <p className="text-xs text-gray-400">
            No spam, unsubscribe anytime. We respect your privacy.
          </p>
        </div>
      </div>
    </div>
  );
}
