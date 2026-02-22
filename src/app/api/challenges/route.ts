import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const lessons = await prisma.lesson.findMany({
    where: { type: 'challenge' },
    include: { module: { include: { course: true } } },
    orderBy: [{ module: { order: 'asc' } }, { order: 'asc' }],
  });
  return NextResponse.json(lessons);
}
