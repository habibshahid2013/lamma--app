"use client";

import { useState } from "react";
import { ArrowLeft, Check, TreeDeciduous, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function PremiumUpgrade() {
  const router = useRouter();
  const { user, userData } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">("yearly");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async () => {
    if (!user) {
      router.push("/auth/login?redirect=/premium");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: selectedPlan,
          userId: user.uid,
          email: user.email,
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Checkout error:", err);
      setError(err instanceof Error ? err.message : "Failed to start checkout");
      setLoading(false);
    }
  };

  // Already premium
  if (userData?.isPremium) {
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
          <h1 className="text-2xl font-bold text-teal-deep mb-2">You're Premium!</h1>
          <p className="text-gray-500 text-center mb-8">
            You have unlimited access to all Lamma+ features.
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
      {/* Header */}
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
            Unlimited access to the gathering. Support the creators who inspire you.
          </p>
        </div>

        {/* Feature List */}
        <div className="w-full space-y-4 mb-10 px-2">
          {[
            "Follow unlimited creators",
            "Ad-free experience",
            "Early access to new content",
            "Directly support faith scholars",
          ].map((feature, idx) => (
            <div key={idx} className="flex items-center space-x-3">
              <div className="w-6 h-6 rounded-full bg-teal/10 flex items-center justify-center flex-shrink-0">
                <Check className="w-3.5 h-3.5 text-teal" />
              </div>
              <span className="text-gray-dark font-medium">{feature}</span>
            </div>
          ))}
        </div>

        {/* Pricing Cards */}
        <div className="w-full space-y-3 mb-8">
          <button
            onClick={() => setSelectedPlan("yearly")}
            disabled={loading}
            className={`w-full p-5 rounded-2xl border-2 flex items-center justify-between transition-all relative overflow-hidden ${
              selectedPlan === "yearly"
                ? "border-teal bg-teal-light ring-1 ring-teal"
                : "border-gray-100 bg-white"
            } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {selectedPlan === "yearly" && (
              <div className="absolute top-0 right-0 bg-teal text-white text-[10px] uppercase font-bold px-2 py-1 rounded-bl-lg">
                Selected
              </div>
            )}
            <div className="text-left">
              <div className="font-bold text-gray-dark text-lg">Yearly</div>
              <div className="text-xs text-teal font-bold bg-teal/10 px-2 py-1 rounded-full inline-block mt-1">
                Best Value · Save 17%
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-xl text-teal">$49.99</div>
              <div className="text-xs text-gray-400">/year</div>
            </div>
          </button>

          <button
            onClick={() => setSelectedPlan("monthly")}
            disabled={loading}
            className={`w-full p-5 rounded-2xl border-2 flex items-center justify-between transition-all ${
              selectedPlan === "monthly"
                ? "border-teal bg-teal-light ring-1 ring-teal"
                : "border-gray-100 bg-white"
            } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <div className="text-left">
              <div className="font-bold text-gray-dark text-lg">Monthly</div>
            </div>
            <div className="text-right">
              <div className="font-bold text-xl text-teal">$4.99</div>
              <div className="text-xs text-gray-400">/month</div>
            </div>
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="w-full mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="w-full mt-auto">
          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full mb-4 py-4 bg-gradient-to-r from-teal to-teal-deep hover:from-teal-deep hover:to-teal text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              "Subscribe Now"
            )}
          </button>
          <p className="text-center text-xs text-gray-400">
            Cancel anytime · Secure payment via Stripe
          </p>
        </div>
      </main>
    </div>
  );
}
