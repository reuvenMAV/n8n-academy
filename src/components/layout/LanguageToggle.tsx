'use client';

import { usePathname, useRouter } from 'next/navigation';

export function LanguageToggle() {
  const locale = 'he';
  const router = useRouter();
  const pathname = usePathname();
  const nextLocale = locale === 'he' ? 'en' : 'he';
  const newPath = pathname.startsWith('/en') ? pathname.replace(/^\/en/, '') || '/' : `/en${pathname}`;
  return (
    <button
      type="button"
      onClick={() => router.push(newPath)}
      className="text-sm px-2 py-1 rounded border border-white/20 hover:bg-white/5"
    >
      {locale === 'he' ? 'EN' : 'עב'}
    </button>
  );
}
