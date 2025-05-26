'use client';

import React, { useState, useRef, KeyboardEvent } from 'react';
import { Send, Camera, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onVoiceClick: () => void;
  isLoading: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSendMessage,
  onVoiceClick,
  isLoading,
  placeholder = 'Type a message...',
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        200
      )}px`;
    }
  };

  return (
    <div className="border-t bg-white p-4">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={() => {/* TODO: Implement camera */}}
            disabled={isLoading}
          >
            <Camera className="h-5 w-5" />
          </Button>

          <div className="relative flex-1">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={isLoading}
              rows={1}
              className={cn(
                'w-full resize-none rounded-2xl border border-gray-300 px-4 py-3 pr-12',
                'focus:border-[#28C6B1] focus:outline-none focus:ring-2 focus:ring-[#28C6B1]/20',
                'disabled:opacity-50',
                'transition-all duration-200'
              )}
              style={{ minHeight: '48px' }}
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute bottom-1 right-1"
              onClick={handleSubmit}
              disabled={!message.trim() || isLoading}
            >
              <Send className="h-5 w-5 text-[#28C6B1]" />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={onVoiceClick}
            disabled={isLoading}
          >
            <Mic className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}