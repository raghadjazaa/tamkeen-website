// src/components/ShareMeetingButton.tsx
"use client";

import { useState } from "react";
import { Link2, Check, Share2 } from "lucide-react";

interface ShareMeetingButtonProps {
  meetingId: string;
}

export function ShareMeetingButton({ meetingId }: ShareMeetingButtonProps) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    const url = `${window.location.origin}/meetings/${meetingId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all border ${
        copied
          ? "bg-emerald-50 text-emerald-600 border-emerald-300"
          : "bg-white text-brand-orange border-brand-orange/30 hover:bg-brand-orange hover:text-white hover:border-brand-orange"
      }`}
    >
      {copied ? (
        <>
          <Check size={16} />
          تم نسخ الرابط
        </>
      ) : (
        <>
          <Share2 size={16} />
          مشاركة الرابط
        </>
      )}
    </button>
  );
}