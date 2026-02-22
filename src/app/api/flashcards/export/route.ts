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

  const reviews = await prisma.flashcardReview.findMany({
    where: { userId: user.id },
    include: { card: { include: { lesson: true } } },
  });

  const ankiCompatible = reviews.map((r) => ({
    front: r.card.front,
    back: r.card.back,
    tags: [r.card.lesson.slug, r.card.type],
  }));

  return NextResponse.json(ankiCompatible);
}
