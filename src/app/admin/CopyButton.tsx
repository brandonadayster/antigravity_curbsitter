"use client";

import React, { useState } from "react";
import { Clipboard, Check } from "lucide-react";

interface CopyButtonProps {
  text: string;
}

export const CopyButton: React.FC<CopyButtonProps> = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div className="relative inline-block leading-none">
      <button
        onClick={handleCopy}
        className="p-1 rounded bg-white/5 border border-white/10 hover:border-electric-cyan/40 text-slate-400 hover:text-electric-cyan hover:bg-white/10 transition-all duration-200 cursor-pointer flex items-center justify-center group"
        title="Copy to clipboard"
        aria-label="Copy to clipboard"
      >
        {copied ? (
          <Check className="w-3 h-3 text-electric-cyan" />
        ) : (
          <Clipboard className="w-3 h-3" />
        )}
      </button>
      
      {copied && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-[#0A0F1D] border border-electric-cyan/30 text-[10px] font-semibold text-electric-cyan rounded shadow-lg animate-fadeIn whitespace-nowrap z-50">
          Copied!
        </span>
      )}
    </div>
  );
};
