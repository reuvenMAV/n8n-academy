import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { getLevelFromXp } from '@/lib/gamification';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { progress: true, badges: { include: { badge: true } } },
  });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  const level = getLevelFromXp(user.xp);
  const completedLessons = user.progress.filter((p) => p.completed).length;
  return NextResponse.json({
    xp: user.xp,
    level: level.key,
    levelLabel: level.labelEn,
    streak: user.streak,
    completedLessons,
    badges: user.badges.map((ub) => ub.badge),
  });
}
