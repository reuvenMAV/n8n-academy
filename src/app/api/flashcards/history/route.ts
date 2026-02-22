import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

function levelFromCount(count: number): number {
  if (count === 0) return 0;
  if (count <= 3) return 1;
  if (count <= 7) return 2;
  if (count <= 14) return 3;
  return 4;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const reviews = await prisma.flashcardReview.findMany({
    where: { userId: user.id, reviewedAt: { gte: oneYearAgo } },
    select: { reviewedAt: true },
  });

  const byDate = new Map<string, number>();
  for (const r of reviews) {
    const date = r.reviewedAt.toISOString().slice(0, 10);
    byDate.set(date, (byDate.get(date) ?? 0) + 1);
  }

  const reviewHistory = Array.from(byDate.entries()).map(([date, count]) => ({
    date,
    count,
    level: levelFromCount(count),
  }));

  return NextResponse.json(reviewHistory);
}
