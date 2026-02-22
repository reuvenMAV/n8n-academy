import Link from 'next/link';
import { prisma } from '@/lib/db/prisma';

export default async function ChallengesPage() {
  const lessons = await prisma.lesson.findMany({
    where: { type: 'challenge' },
    include: { module: { include: { course: true } } },
    orderBy: [{ module: { order: 'asc' } }, { order: 'asc' }],
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text-primary">Challenges</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {lessons.map((l) => (
          <Link
            key={l.id}
            href={`/courses/${l.module.courseId}/${l.id}`}
            className="block rounded-lg border border-white/10 bg-surface p-4 hover:border-primary/50"
          >
            <h2 className="text-lg font-semibold text-text-primary">{l.titleEn}</h2>
            <p className="text-sm text-text-secondary mt-1">{l.xpReward} XP</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
