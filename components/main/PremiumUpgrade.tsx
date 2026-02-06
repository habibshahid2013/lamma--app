"use client";

import { useState } from "react";
import { ArrowLeft, TreeDeciduous, Mail, Check, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function PremiumUpgrade() {
  const router = useRouter();
  const { user } = useAuth();
  const [email, setEmail] = useState(user?.email || "");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // Check if email already exists
      const q = query(collection(db, "waitlist"), where("email", "==", email.trim().toLowerCase()));
      const existing = await getDocs(q);

      if (!existing.empty) {
        setSubmitted(true);
        setLoading(false);
        return;
      }

      await addDoc(collection(db, "waitlist"), {
        email: email.trim().toLowerCase(),
        userId: user?.uid || null,
        source: "premium_page",
        createdAt: new Date(),
      });

      setSubmitted(true);
    } catch (err) {
      console.error("Waitlist error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <div className="p-4">
          <button onClick={() => router.back()}>
            <ArrowLeft className="w-6 h-6 text-gray-dark" />
          </button>
        </div>
        <main className="flex-1 flex flex-col items-center justify-center px-6 pb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-teal to-gold rounded-full flex items-center justify-center mb-6">
            <Check className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-teal-deep mb-2">You&apos;re on the list!</h1>
          <p className="text-gray-500 text-center mb-8">
            We&apos;ll notify you when premium features launch. Thank you for your interest in supporting faith scholars.
          </p>
          <button
            onClick={() => router.push("/home")}
            className="px-8 py-3 bg-teal hover:bg-teal-deep text-white rounded-xl font-semibold transition-colors"
          >
            Continue Exploring
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="p-4">
        <button onClick={() => router.back()}>
          <ArrowLeft className="w-6 h-6 text-gray-dark" />
        </button>
      </div>

      <main className="flex-1 flex flex-col items-center px-6 pb-8">
        <div className="w-full bg-gold/10 rounded-3xl p-8 mb-8 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-gold rounded-full flex items-center justify-center mb-4 shadow-sm">
            <TreeDeciduous className="w-10 h-10 text-teal-deep" />
          </div>

          <h1 className="text-3xl font-bold text-teal mb-2">LAMMA+ Premium</h1>
          <p className="text-teal-deep/80 text-sm font-medium">
            Premium features are coming soon. Be the first to know when we launch.
          </p>
        </div>

        {/* Upcoming Features */}
        <div className="w-full space-y-4 mb-10 px-2">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Coming Soon</h3>
          {[
            "Ad-free experience",
            "Early access to new content",
            "Directly support faith scholars",
            "Exclusive scholar Q&A sessions",
          ].map((feature, idx) => (
            <div key={idx} className="flex items-center space-x-3">
              <div className="w-6 h-6 rounded-full bg-teal/10 flex items-center justify-center flex-shrink-0">
                <Check className="w-3.5 h-3.5 text-teal" />
              </div>
              <span className="text-gray-dark font-medium">{feature}</span>
            </div>
          ))}
        </div>

        {/* Email Collection */}
        <form onSubmit={handleSubmit} className="w-full mt-auto">
          <div className="w-full mb-4">
            <label htmlFor="waitlist-email" className="block text-sm font-semibold text-gray-dark mb-2">
              Get notified when we launch
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="waitlist-email"
                type="email"
                required
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-teal focus:outline-none text-gray-dark"
              />
            </div>
          </div>

          {error && (
            <div className="w-full mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !email.trim()}
            className="w-full mb-4 py-4 bg-gradient-to-r from-teal to-teal-deep hover:from-teal-deep hover:to-teal text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Joining...
              </>
            ) : (
              "Join the Waitlist"
            )}
          </button>
          <p className="text-center text-xs text-gray-400">
            No spam, ever. We&apos;ll only email you about Lamma+ updates.
          </p>
        </form>
      </main>
    </div>
  );
}
