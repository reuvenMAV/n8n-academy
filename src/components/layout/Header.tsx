'use client';

import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { LanguageToggle } from '@/components/layout/LanguageToggle';

export function Header() {
  const t = useTranslations('nav');
  return (
    <header className="h-14 border-b border-white/10 bg-surface flex items-center justify-between px-4">
      <div />
      <div className="flex items-center gap-2">
        <LanguageToggle />
        <Link href="/profile">
          <Button variant="ghost" size="sm">{t('profile')}</Button>
        </Link>
        <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: '/' })}>
          {t('logout')}
        </Button>
      </div>
    </header>
  );
}
