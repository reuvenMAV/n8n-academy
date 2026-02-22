'use client';

import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LanguageToggle } from '@/components/layout/LanguageToggle';

export function Header() {
  return (
    <header className="h-14 border-b border-white/10 bg-surface flex items-center justify-between px-4">
      <div />
      <div className="flex items-center gap-2">
        <LanguageToggle />
        <Link href="/profile">
          <Button variant="ghost" size="sm">פרופיל</Button>
        </Link>
        <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: '/' })}>
          יציאה
        </Button>
      </div>
    </header>
  );
}
