"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, TreeDeciduous, Sparkles } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function PremiumSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);

  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    // Refresh user data to get updated premium status
    const verifySubscription = async () => {
      if (sessionId && refreshUser) {
        await refreshUser();
      }
      setLoading(false);
    };

    verifySubscription();
  }, [sessionId, refreshUser]);

  useEffect(() => {
    // Confetti effect
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gold-light to-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-gold-light via-white to-teal-light">
      {/* Success Animation */}
      <div className="relative mb-8">
        <div className="w-32 h-32 bg-gradient-to-br from-teal to-gold rounded-full flex items-center justify-center shadow-xl animate-pulse">
          <CheckCircle2 className="w-16 h-16 text-white" />
        </div>
        <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-gold animate-bounce" />
        <Sparkles className="absolute -bottom-2 -left-2 w-6 h-6 text-teal animate-bounce delay-150" />
      </div>

      {/* Content */}
      <div className="text-center max-w-md">
        <h1 className="text-3xl font-bold text-teal-deep mb-3">
          Welcome to Premium!
        </h1>
        <p className="text-gray-600 mb-2">
          Thank you for supporting Lamma+. Your subscription is now active.
        </p>
        <p className="text-sm text-gray-500 mb-8">
          You now have unlimited access to follow all your favorite scholars.
        </p>

        {/* Benefits Unlocked */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gold/10 rounded-lg">
              <TreeDeciduous className="w-5 h-5 text-gold" />
            </div>
            <span className="font-semibold text-gray-800">Benefits Unlocked</span>
          </div>
          <ul className="space-y-3 text-left">
            {[
              "Unlimited scholar follows",
              "Ad-free experience",
              "Early access to new content",
              "Support faith educators directly",
            ].map((benefit, i) => (
              <li key={i} className="flex items-center gap-3 text-gray-700">
                <CheckCircle2 className="w-4 h-4 text-teal flex-shrink-0" />
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Link
            href="/home"
            className="block w-full py-3.5 bg-gradient-to-r from-teal to-teal-deep text-white rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            Start Exploring
          </Link>
          <Link
            href="/following"
            className="block w-full py-3.5 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:border-teal hover:text-teal transition-all"
          >
            View Following List
          </Link>
        </div>
      </div>

      {/* Footer */}
      <p className="mt-12 text-xs text-gray-400 text-center">
        A confirmation email has been sent to your inbox.
        <br />
        Questions? Contact{" "}
        <a href="mailto:support@lamma.app" className="text-teal hover:underline">
          support@lamma.app
        </a>
      </p>
    </div>
  );
}
