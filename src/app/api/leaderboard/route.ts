import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, image: true, xp: true, level: true },
    orderBy: { xp: 'desc' },
    take: 50,
  });
  return NextResponse.json(users);
}
