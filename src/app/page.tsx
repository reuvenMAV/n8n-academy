import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-4xl md:text-6xl font-bold text-text-primary">למדו N8N by Doing</h1>
        <p className="text-lg text-text-secondary">בנו workflows אמיתיים בדפדפן, צעד אחר צעד.</p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/login">
            <Button size="lg">התחילו עכשיו</Button>
          </Link>
          <Link href="/courses">
            <Button variant="outline" size="lg">קורסים / Courses</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
