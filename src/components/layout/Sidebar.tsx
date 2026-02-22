'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, BookOpen, Gamepad2, Trophy, User, BookMarked } from 'lucide-react';

const NAV_LABELS: Record<string, string> = {
  dashboard: 'לוח בקרה',
  courses: 'קורסים',
  review: 'חזרה יומית',
  playground: 'מגרש משחקים',
  challenges: 'אתגרים',
  profile: 'פרופיל',
};

const items = [
  { href: '/dashboard', icon: LayoutDashboard, key: 'dashboard' },
  { href: '/courses', icon: BookOpen, key: 'courses' },
  { href: '/review', icon: BookMarked, key: 'review' },
  { href: '/playground', icon: Gamepad2, key: 'playground' },
  { href: '/challenges', icon: Trophy, key: 'challenges' },
  { href: '/profile', icon: User, key: 'profile' },
];

export function Sidebar() {
  const pathname = usePathname();
  const [dueCount, setDueCount] = useState<number | null>(null);
  useEffect(() => {
    fetch('/api/flashcards/stats')
      .then((res) => res.json())
      .then((data) => { if (!data.error && data.dueToday != null) setDueCount(data.dueToday); })
      .catch(() => {});
  }, []);
  return (
    <aside className="w-56 bg-surface border-r border-white/10 flex flex-col min-h-screen">
      <div className="p-4 border-b border-white/10">
        <Link href="/dashboard" className="font-bold text-lg text-primary">N8N Academy</Link>
      </div>
      <nav className="p-2 flex-1 space-y-1">
        {items.map(({ href, icon: Icon, key }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg text-text-primary hover:bg-white/5 transition-colors',
              pathname === href || pathname.startsWith(href + '/') ? 'bg-primary/20 text-primary' : ''
            )}
          >
            <Icon className="w-5 h-5 shrink-0" />
            {NAV_LABELS[key]}
            {key === 'review' && dueCount != null && dueCount > 0 && (
              <span className="ml-auto bg-primary text-white text-xs font-bold rounded-full min-w-[1.25rem] h-5 px-1.5 flex items-center justify-center">
                {dueCount > 99 ? '99+' : dueCount}
              </span>
            )}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
