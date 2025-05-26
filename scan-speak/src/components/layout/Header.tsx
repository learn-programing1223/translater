'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Globe, MessageSquare, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LanguageSelector } from './LanguageSelector';

export function Header() {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <h1 
            className="text-2xl font-bold text-[#28C6B1] cursor-pointer"
            onClick={() => router.push('/')}
          >
            Scan & Speak
          </h1>
          
          <nav className="hidden md:flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/chat')}
              className="gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              Chat
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/voice')}
              className="gap-2"
            >
              <Mic className="h-4 w-4" />
              Voice
            </Button>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <LanguageSelector />
        </div>
      </div>
    </header>
  );
}