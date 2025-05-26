'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { TypingIndicator } from './TypingIndicator';
import { useChatStore } from '@/stores/chatStore';
import { useLocaleStore } from '@/stores/localeStore';
import { catalogService } from '@/lib/db/catalog';
import { streamChat } from '@/lib/ai/openai';
import { generateId } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

export function ChatInterface() {
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, isLoading, error, addMessage, updateMessage, setLoading, setError } = useChatStore();
  const { currentLocale } = useLocaleStore();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage = {
      content,
      role: 'user' as const,
      language: currentLocale,
    };

    addMessage(userMessage);
    setLoading(true);
    setError(null);

    try {
      // Search for relevant products
      const products = await catalogService.searchProducts(content, currentLocale);

      // Create assistant message
      const assistantMessageId = generateId();
      const assistantMessage = {
        id: assistantMessageId,
        content: '',
        role: 'assistant' as const,
        language: currentLocale,
        timestamp: new Date(),
        isStreaming: true,
      };

      addMessage(assistantMessage);

      let fullContent = '';

      await streamChat(
        content,
        currentLocale,
        products,
        {
          onChunk: (chunk) => {
            fullContent += chunk;
            updateMessage(assistantMessageId, fullContent);
          },
          onComplete: () => {
            updateMessage(assistantMessageId, fullContent);
            setLoading(false);
          },
          onError: (error) => {
            console.error('Chat error:', error);
            setError('Failed to get response. Please try again.');
            setLoading(false);
          },
        }
      );
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
      setLoading(false);
    }
  };

  const handleVoiceClick = () => {
    router.push('/voice');
  };

  const handleRetry = () => {
    const lastUserMessage = messages
      .slice()
      .reverse()
      .find(m => m.role === 'user');
    
    if (lastUserMessage) {
      handleSendMessage(lastUserMessage.content);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-8">
        <div className="mx-auto max-w-4xl space-y-4">
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <h2 className="mb-2 text-2xl font-semibold text-gray-700">
                  Welcome to Scan & Speak
                </h2>
                <p className="text-gray-500">
                  Ask me anything about products in any language!
                </p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              {isLoading && !messages[messages.length - 1]?.isStreaming && (
                <div className="flex justify-start">
                  <div className="rounded-2xl bg-[#F1F3F5] shadow-md">
                    <TypingIndicator />
                  </div>
                </div>
              )}
              {error && (
                <div className="flex justify-center">
                  <div className="rounded-lg bg-red-50 p-4 text-red-600">
                    <p className="text-sm">{error}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRetry}
                      className="mt-2 text-red-600 hover:text-red-700"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Retry
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <ChatInput
        onSendMessage={handleSendMessage}
        onVoiceClick={handleVoiceClick}
        isLoading={isLoading}
        placeholder={`Type in ${currentLocale === 'en' ? 'any language' : 'your language'}...`}
      />
    </div>
  );
}