"use client";

import { useRouter } from "next/navigation";
import { XCircle, ArrowLeft, TreeDeciduous } from "lucide-react";
import Link from "next/link";

export default function PremiumCancelPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-gray-50 to-white">
      {/* Icon */}
      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-8">
        <XCircle className="w-12 h-12 text-gray-400" />
      </div>

      {/* Content */}
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-3">
          Payment Canceled
        </h1>
        <p className="text-gray-600 mb-8">
          No worries! Your payment was not processed. You can try again whenever
          you're ready.
        </p>

        {/* What You're Missing */}
        <div className="bg-gold/5 rounded-2xl p-6 border border-gold/20 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gold/10 rounded-lg">
              <TreeDeciduous className="w-5 h-5 text-gold" />
            </div>
            <span className="font-semibold text-gray-800">
              Premium Benefits
            </span>
          </div>
          <ul className="space-y-2 text-left text-sm text-gray-600">
            <li>• Unlimited scholar follows</li>
            <li>• Ad-free experience</li>
            <li>• Early access to new content</li>
            <li>• Support faith educators</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Link
            href="/premium"
            className="block w-full py-3.5 bg-gradient-to-r from-teal to-teal-deep text-white rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            Try Again
          </Link>
          <button
            onClick={() => router.push("/home")}
            className="flex items-center justify-center gap-2 w-full py-3.5 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:border-gray-300 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Continue with Free Plan
          </button>
        </div>
      </div>

      {/* Footer */}
      <p className="mt-12 text-xs text-gray-400 text-center">
        Need help?{" "}
        <a href="mailto:support@lamma.app" className="text-teal hover:underline">
          Contact support
        </a>
      </p>
    </div>
  );
}
