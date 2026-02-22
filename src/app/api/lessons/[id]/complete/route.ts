import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { applyStreakMultiplier } from '@/lib/gamification';
import { getLevelFromXp } from '@/lib/gamification';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id: lessonId } = await params;
  const body = await request.json().catch(() => ({}));
  const { score = 100 } = body as { score?: number };
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
  if (!lesson) return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
  const xpReward = lesson.type === 'challenge' ? 100 : 50;
  const withStreak = applyStreakMultiplier(xpReward, user.streak);
  const progress = await prisma.progress.upsert({
    where: { userId_lessonId: { userId: user.id, lessonId } },
    create: {
      userId: user.id,
      lessonId,
      completed: true,
      score,
      attempts: 1,
      completedAt: new Date(),
    },
    update: {
      completed: true,
      score,
      attempts: { increment: 1 },
      completedAt: new Date(),
    },
  });
  const newXp = user.xp + withStreak;
  const level = getLevelFromXp(newXp);
  await prisma.user.update({
    where: { id: user.id },
    data: { xp: newXp, level: level.key, lastActiveAt: new Date() },
  });
  return NextResponse.json({ progress, xpEarned: withStreak });
}
