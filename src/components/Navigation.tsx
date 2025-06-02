'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Home', icon: '🏠' },
    { href: '/chat', label: 'Chat', icon: '💬' },
    { href: '/voice', label: 'Voice', icon: '🎤' },
  ];

  return (
    <nav className="relative bg-white/90 backdrop-blur-lg border-t border-gray-200 shadow-lg">
      <div className="flex justify-center space-x-6 px-4 py-3">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`relative flex flex-col items-center py-2 px-6 rounded-2xl transition-all duration-300 ${
              pathname === item.href
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg scale-105'
                : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
            }`}
          >
            <span className="text-xl mb-1">{item.icon}</span>
            <span className="text-xs font-semibold">{item.label}</span>
            {pathname === item.href && (
              <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full" />
            )}
          </Link>
        ))}
      </div>
    </nav>
  );
}