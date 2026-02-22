import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { validateWorkflow } from '@/lib/canvas/validationEngine';
import type { ValidationRule } from '@/lib/canvas/validationEngine';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id: lessonId } = await params;
  const body = await request.json();
  const { nodes, edges, rules, locale = 'he' } = body as {
    nodes: unknown[];
    edges: unknown[];
    rules: ValidationRule[];
    locale?: 'he' | 'en';
  };
  if (!nodes || !edges || !rules) {
    return NextResponse.json({ error: 'nodes, edges, rules required' }, { status: 400 });
  }
  const result = await validateWorkflow(
    nodes as Parameters<typeof validateWorkflow>[0],
    edges as Parameters<typeof validateWorkflow>[1],
    rules,
    locale,
    lessonId
  );
  if (result.passed) {
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (user) {
      await prisma.progress.upsert({
        where: { userId_lessonId: { userId: user.id, lessonId } },
        create: { userId: user.id, lessonId, completed: true, score: result.score, attempts: 1, completedAt: new Date() },
        update: { completed: true, score: result.score, attempts: { increment: 1 }, completedAt: new Date() },
      });
      const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
      const xp = lesson?.type === 'challenge' ? 100 : 50;
      await prisma.user.update({
        where: { id: user.id },
        data: { xp: user.xp + xp, lastActiveAt: new Date() },
      });
    }
  }
  return NextResponse.json(result);
}
