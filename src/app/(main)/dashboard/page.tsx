import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { getLevelFromXp } from '@/lib/gamification';
import { ProgressCard } from '@/components/dashboard/ProgressCard';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { BadgeGrid } from '@/components/dashboard/BadgeGrid';
import { StreakCard } from '@/components/dashboard/StreakCard';
import { FlashcardStats } from '@/components/flashcards/FlashcardStats';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { badges: { include: { badge: true } }, progress: { include: { lesson: true } } },
  });
  if (!user) return null;
  const level = getLevelFromXp(user.xp);
  const completedLessons = user.progress.filter((p) => p.completed).length;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard label="XP" value={user.xp} />
        <StatsCard label="Level" value={level.labelEn} />
        <StatsCard label="Streak" value={`${user.streak} days`} />
        <StatsCard label="Lessons" value={completedLessons} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <StreakCard streak={user.streak} />
        <FlashcardStats />
      </div>
      <ProgressCard progress={user.progress} />
      <BadgeGrid badges={user.badges.map((ub) => ub.badge)} />
    </div>
  );
}
