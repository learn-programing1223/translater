'use client';

import React, { useEffect, useState } from 'react';
import { Message } from '@/types';
import { cn, getLanguageName } from '@/lib/utils';
import { API_CONFIG } from '@/lib/constants';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const [displayedContent, setDisplayedContent] = useState('');
  const isUser = message.role === 'user';

  useEffect(() => {
    if (!message.isStreaming || isUser) {
      setDisplayedContent(message.content);
      return;
    }

    // Typewriter effect for assistant messages
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < message.content.length) {
        setDisplayedContent(message.content.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, API_CONFIG.TYPEWRITER_DELAY);

    return () => clearInterval(interval);
  }, [message.content, message.isStreaming, isUser]);

  return (
    <div
      className={cn(
        'flex w-full animate-slideUp',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'relative max-w-[70%] rounded-2xl px-4 py-3 shadow-md transition-all duration-300 hover:shadow-lg',
          isUser
            ? 'bg-[#28C6B1] text-white'
            : 'bg-[#F1F3F5] text-[#212529]'
        )}
      >
        {/* Language tag */}
        <div
          className={cn(
            'absolute -top-2 text-xs font-medium',
            isUser ? 'right-3' : 'left-3'
          )}
        >
          <span
            className={cn(
              'rounded-full px-2 py-0.5',
              isUser
                ? 'bg-[#28C6B1]/80 text-white/90'
                : 'bg-[#F1F3F5]/80 text-[#212529]/70'
            )}
          >
            {getLanguageName(message.language)}
          </span>
        </div>

        {/* Message content */}
        <p className="mt-2 whitespace-pre-wrap break-words">
          {displayedContent}
          {message.isStreaming && displayedContent.length < message.content.length && (
            <span className="inline-block h-4 w-1 animate-pulse bg-current ml-0.5" />
          )}
        </p>

        {/* Timestamp */}
        <time
          className={cn(
            'mt-1 block text-xs',
            isUser ? 'text-white/70' : 'text-[#212529]/50'
          )}
        >
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </time>
      </div>
    </div>
  );
}