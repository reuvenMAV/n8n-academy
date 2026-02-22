import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const w = await prisma.savedWorkflow.findFirst({
    where: { id, user: { email: session.user.email } },
  });
  if (!w) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(w);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  const w = await prisma.savedWorkflow.findFirst({ where: { id, userId: user.id } });
  if (!w) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const body = await request.json();
  const updated = await prisma.savedWorkflow.update({
    where: { id },
    data: { title: body.title ?? w.title, data: (body.data as object) ?? w.data },
  });
  return NextResponse.json(updated);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  const { id } = await params;
  await prisma.savedWorkflow.deleteMany({ where: { id, userId: user.id } });
  return NextResponse.json({ ok: true });
}
