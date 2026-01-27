"use client";

import { useState } from "react";
import { ArrowLeft, Check, TreeDeciduous } from "lucide-react";
import { useRouter } from "next/navigation";
import Button from "../ui/Button";

export default function PremiumUpgrade() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">("yearly");

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
             "Follow unlimited creators (5/5 used)",
             "Ad-free experience",
             "Early access to new content",
             "Directly support faith scholars"
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
            className={`w-full p-5 rounded-2xl border-2 flex items-center justify-between transition-all relative overflow-hidden ${
              selectedPlan === "yearly"
                ? "border-teal bg-teal-light ring-1 ring-teal"
                : "border-gray-100 bg-white"
            }`}
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
            className={`w-full p-5 rounded-2xl border-2 flex items-center justify-between transition-all ${
              selectedPlan === "monthly"
                ? "border-teal bg-teal-light ring-1 ring-teal"
                : "border-gray-100 bg-white"
            }`}
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

        <div className="w-full mt-auto">
          <Button className="w-full mb-4 text-lg">
             Subscribe Now
          </Button>
          <p className="text-center text-xs text-gray-400">
            Cancel anytime • <button className="underline">Restore purchase</button>
          </p>
        </div>
      </main>
    </div>
  );
}
