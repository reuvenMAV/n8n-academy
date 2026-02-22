import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { getLevelFromXp } from '@/lib/gamification';

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect('/login');
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { badges: { include: { badge: true } } },
  });
  if (!user) redirect('/login');
  const level = getLevelFromXp(user.xp);

  return (
    <div className="space-y-6 max-w-lg">
      <h1 className="text-2xl font-bold text-text-primary">Profile</h1>
      <div className="rounded-lg border border-white/10 bg-surface p-4 space-y-2">
        <p className="text-text-secondary">Email</p>
        <p className="text-text-primary">{user.email}</p>
        <p className="text-text-secondary mt-2">Name</p>
        <p className="text-text-primary">{user.name ?? '—'}</p>
        <p className="text-text-secondary mt-2">Level</p>
        <p className="text-text-primary">{level.labelEn}</p>
        <p className="text-text-secondary mt-2">XP</p>
        <p className="text-text-primary">{user.xp}</p>
        <p className="text-text-secondary mt-2">Streak</p>
        <p className="text-text-primary">{user.streak} days</p>
      </div>
    </div>
  );
}
