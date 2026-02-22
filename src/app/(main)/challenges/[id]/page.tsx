import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';

export default async function ChallengePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lesson = await prisma.lesson.findUnique({
    where: { id, type: 'challenge' },
    include: { module: true },
  });
  if (!lesson) notFound();
  redirect(`/courses/${lesson.module.courseId}/${lesson.id}`);
}
