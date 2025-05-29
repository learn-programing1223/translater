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
    <nav className="bg-white border-t border-gray-200 px-4 py-2">
      <div className="flex justify-center space-x-8">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center py-2 px-4 rounded-lg transition-colors ${
              pathname === item.href
                ? 'bg-primary text-white'
                : 'text-gray-600 hover:text-primary hover:bg-primary/10'
            }`}
          >
            <span className="text-lg mb-1">{item.icon}</span>
            <span className="text-xs font-medium">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}