import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { lessonId } = await params;
  const cards = await prisma.flashcard.findMany({
    where: { lessonId },
    include: { lesson: true },
    take: 50,
  });
  const shuffled = [...cards].sort(() => Math.random() - 0.5).slice(0, 3);
  return NextResponse.json(
    shuffled.map((c) => ({
      id: c.id,
      lessonId: c.lessonId,
      lessonSlug: c.lesson.slug,
      front: c.front,
      frontEn: c.frontEn,
      back: c.back,
      backEn: c.backEn,
      type: c.type,
    }))
  );
}
