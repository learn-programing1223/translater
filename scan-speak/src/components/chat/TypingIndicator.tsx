'use client';

import React from 'react';

export function TypingIndicator() {
  return (
    <div className="flex items-center space-x-1 px-4 py-3">
      <div className="h-2 w-2 animate-bounce rounded-full bg-[#212529]/40 [animation-delay:-0.3s]" />
      <div className="h-2 w-2 animate-bounce rounded-full bg-[#212529]/40 [animation-delay:-0.15s]" />
      <div className="h-2 w-2 animate-bounce rounded-full bg-[#212529]/40" />
    </div>
  );
}