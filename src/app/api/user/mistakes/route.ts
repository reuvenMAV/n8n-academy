import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await request.json();
  const { lessonId, nodeType, ruleId } = body as { lessonId: string; nodeType: string; ruleId: string };
  if (!lessonId || !nodeType || !ruleId) {
    return NextResponse.json({ error: 'Missing lessonId, nodeType or ruleId' }, { status: 400 });
  }
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  await prisma.mistakeLog.create({
    data: { userId: user.id, lessonId, nodeType, ruleId },
  });
  return NextResponse.json({ ok: true });
}
