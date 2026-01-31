"use client";

import React from 'react';
import { X, Lock, UserPlus, LogIn } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ActionGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  triggerAction?: string; // e.g., 'follow', 'save', 'view_content'
}

export default function ActionGateModal({
  isOpen,
  onClose,
  title = "Unlock Full Access",
  description = "Join our community to follow scholars, save content, and personalize your feed.",
  triggerAction
}: ActionGateModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-teal-deep/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header with Pattern */}
        <div className="bg-teal h-24 relative overflow-hidden flex items-center justify-center">
             <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]"></div>
             <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
                <Lock className="w-8 h-8 text-white" />
             </div>
             <button 
                onClick={onClose}
                className="absolute top-3 right-3 text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
             >
                <X className="w-5 h-5" />
             </button>
        </div>

        <div className="p-6 text-center">
          <h2 className="text-xl font-bold text-gray-dark mb-2">{title}</h2>
          <p className="text-gray-500 text-sm mb-6 leading-relaxed">
            {description}
          </p>

          <div className="space-y-3">
            <button
              onClick={() => {
                 onClose();
                 router.push('/auth/signup');
              }}
              className="w-full bg-teal text-white font-bold py-3 rounded-xl shadow-lg shadow-teal/20 hover:bg-teal-deep transition-all flex items-center justify-center"
            >
              <UserPlus className="w-5 h-5 mr-2" />
              Create Free Account
            </button>
            
            <button
              onClick={() => {
                 onClose();
                 router.push('/auth/login');
              }}
              className="w-full bg-white text-gray-700 font-bold py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all flex items-center justify-center"
            >
              <LogIn className="w-5 h-5 mr-2" />
              Sign In
            </button>
          </div>

          <p className="text-xs text-gray-400 mt-4">
            It takes less than 1 minute to join the gathering.
          </p>
        </div>
      </div>
    </div>
  );
}
