"use client";

import { X, Share2, Copy, Download, Twitter, Facebook } from "lucide-react";
import { Creator } from "@/lib/types/creator";
import { useState } from "react";
// import html2canvas from "html2canvas"; // If we were doing real image generation, for now mock

interface ShareModalProps {
  creator: Creator;
  isOpen: boolean;
  onClose: () => void;
}

export default function ShareModal({ creator, isOpen, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  if (!isOpen) return null;

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/creator/${creator.id}` : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in">
        <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-dark">Share Profile</h3>
                <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
            </div>

            {/* Preview Card (Mock of what image would look like) */}
            <div className="p-6 bg-gray-50 flex justify-center">
                <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100 w-full max-w-[240px] text-center">
                     <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl">
                        {creator.countryFlag}
                     </div>
                     <h4 className="font-bold text-gray-900">{creator.name}</h4>
                     <p className="text-xs text-teal font-medium mb-2 uppercase tracking-wide">{creator.category}</p>
                     <p className="text-[10px] text-gray-500 line-clamp-2">{creator.note}</p>
                     <div className="mt-3 pt-3 border-t border-gray-100 flex justify-center gap-2">
                        {creator.topics.slice(0, 2).map(t => (
                            <span key={t} className="text-[9px] bg-gray-100 text-gray-500 px-2 py-1 rounded-full">{t}</span>
                        ))}
                     </div>
                     <div className="mt-4 text-[10px] text-gray-400 font-medium">lamma.app</div>
                </div>
            </div>

            {/* Actions */}
            <div className="p-4 grid grid-cols-4 gap-4 justify-items-center border-b border-gray-100">
                <button className="flex flex-col items-center gap-1 text-gray-500 hover:text-teal transition-colors">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                        <Twitter className="w-5 h-5" />
                    </div>
                    <span className="text-[10px]">Twitter</span>
                </button>
                 <button className="flex flex-col items-center gap-1 text-gray-500 hover:text-teal transition-colors">
                    <div className="w-10 h-10 rounded-full bg-blue-900/10 flex items-center justify-center text-blue-800">
                        <Facebook className="w-5 h-5" />
                    </div>
                    <span className="text-[10px]">Facebook</span>
                </button>
                 <button className="flex flex-col items-center gap-1 text-gray-500 hover:text-teal transition-colors">
                    <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                        <Share2 className="w-5 h-5" />
                    </div>
                    <span className="text-[10px]">WhatsApp</span>
                </button>
                 <button className="flex flex-col items-center gap-1 text-gray-500 hover:text-teal transition-colors">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700">
                        <Download className="w-5 h-5" />
                    </div>
                    <span className="text-[10px]">Save</span>
                </button>
            </div>

            {/* Link Copy */}
            <div className="p-4 bg-gray-50">
                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
                    <span className="text-xs text-gray-400 truncate flex-1">{shareUrl}</span>
                    <button onClick={handleCopy} className="text-teal font-bold text-xs hover:underline">
                        {copied ? "Copied!" : "Copy"}
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
}
