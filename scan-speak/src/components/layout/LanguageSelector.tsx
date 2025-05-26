'use client';

import React, { useState } from 'react';
import { Globe, Check, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocaleStore } from '@/stores/localeStore';
import { cn } from '@/lib/utils';

export function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { currentLocale, supportedLocales, setLocale } = useLocaleStore();

  const currentLanguage = supportedLocales.find(l => l.code === currentLocale);

  const filteredLocales = supportedLocales.filter(locale =>
    locale.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    locale.nativeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    locale.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectLanguage = (code: string) => {
    setLocale(code);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2"
      >
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline">
          {currentLanguage?.flag} {currentLanguage?.nativeName}
        </span>
        <span className="sm:hidden">{currentLanguage?.flag}</span>
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => {
              setIsOpen(false);
              setSearchQuery('');
            }}
          />

          {/* Dropdown */}
          <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-lg border bg-white shadow-lg">
            {/* Search */}
            <div className="border-b p-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search languages..."
                  className="w-full rounded-md border py-2 pl-10 pr-3 text-sm focus:border-[#28C6B1] focus:outline-none focus:ring-1 focus:ring-[#28C6B1]"
                  autoFocus
                />
              </div>
            </div>

            {/* Language list */}
            <div className="max-h-96 overflow-y-auto p-2">
              {filteredLocales.length === 0 ? (
                <p className="py-4 text-center text-sm text-gray-500">
                  No languages found
                </p>
              ) : (
                <div className="space-y-1">
                  {filteredLocales.map((locale) => (
                    <button
                      key={locale.code}
                      onClick={() => handleSelectLanguage(locale.code)}
                      className={cn(
                        'flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors',
                        'hover:bg-gray-100',
                        currentLocale === locale.code && 'bg-[#28C6B1]/10 text-[#28C6B1]'
                      )}
                      dir={locale.rtl ? 'rtl' : 'ltr'}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{locale.flag}</span>
                        <div className="text-left">
                          <div className="font-medium">{locale.nativeName}</div>
                          <div className="text-xs text-gray-500">{locale.name}</div>
                        </div>
                      </div>
                      {currentLocale === locale.code && (
                        <Check className="h-4 w-4 text-[#28C6B1]" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t p-3 text-center text-xs text-gray-500">
              {supportedLocales.length} languages available
            </div>
          </div>
        </>
      )}
    </div>
  );
}