import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const totalCards = await prisma.flashcard.count();
  const now = new Date();
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);

  const dueToday = await prisma.flashcardReview.count({
    where: { userId: user.id, nextReview: { lte: endOfToday } },
  });

  const masteredCards = await prisma.flashcardReview.count({
    where: { userId: user.id, interval: { gt: 21 } },
  });

  return NextResponse.json({
    totalCards,
    dueToday,
    streak: user.flashcardStreak ?? 0,
    masteredCards,
  });
}
