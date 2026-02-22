import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { LessonLayout } from '@/components/lesson/LessonLayout';
import { getLocale } from 'next-intl/server';

export default async function LessonPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>;
}) {
  const { courseId, lessonId } = await params;
  const session = await getServerSession(authOptions);
  const locale = (await getLocale()) as 'he' | 'en';
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { module: { include: { course: true } } },
  });
  if (!lesson || lesson.module.courseId !== courseId) notFound();
  const content = lesson.content as { instructionsHe?: string; instructionsEn?: string; videoUrl?: string };
  const instructions = locale === 'he' ? content.instructionsHe ?? content.instructionsEn : content.instructionsEn ?? content.instructionsHe;
  const validationRules = (lesson.validationRules ?? []) as unknown as import('@/lib/canvas/validationEngine').ValidationRule[];
  const hints = (lesson.hints as string[]) ?? [];
  const starterTemplate = lesson.starterTemplate as { nodes: unknown[]; edges: unknown[] } | null;

  return (
    <LessonLayout
      lessonId={lesson.id}
      courseId={courseId}
      titleHe={lesson.titleHe}
      titleEn={lesson.titleEn}
      type={lesson.type}
      instructions={instructions ?? ''}
      videoUrl={content.videoUrl}
      validationRules={validationRules}
      hints={hints}
      starterTemplate={starterTemplate}
      xpReward={lesson.xpReward}
      estimatedMin={lesson.estimatedMin}
      userId={session?.user?.email ? ((await prisma.user.findUnique({ where: { email: session.user.email } }))?.id ?? null) : null}
    />
  );
}
