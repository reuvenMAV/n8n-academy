import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';

export default async function LandingPage() {
  const t = await getTranslations('landing');
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-4xl md:text-6xl font-bold text-text-primary">{t('heroTitle')}</h1>
        <p className="text-lg text-text-secondary">{t('heroSubtitle')}</p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/login">
            <Button size="lg">{t('cta')}</Button>
          </Link>
          <Link href="/courses">
            <Button variant="outline" size="lg">קורסים / Courses</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
