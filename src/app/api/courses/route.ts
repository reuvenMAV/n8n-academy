import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const courses = await prisma.course.findMany({
    orderBy: { order: 'asc' },
    include: { modules: { include: { _count: { select: { lessons: true } } } } },
  });
  return NextResponse.json(courses);
}
