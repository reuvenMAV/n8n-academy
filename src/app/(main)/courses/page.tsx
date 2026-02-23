import Link from 'next/link';
import { prisma } from '@/lib/db/prisma';

export default async function CoursesPage() {
  const locale = 'he';
  const courses = await prisma.course.findMany({
    orderBy: { order: 'asc' },
    include: { modules: { include: { _count: { select: { lessons: true } } } } },
  });
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text-primary">{locale === 'he' ? 'קורסים' : 'Courses'}</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((c) => {
          const lessonCount = c.modules.reduce((acc, m) => acc + m._count.lessons, 0);
          const moduleCount = c.modules.length;
          return (
            <Link
              key={c.id}
              href={`/courses/${c.id}`}
              className="block rounded-lg border border-white/10 bg-surface p-4 hover:border-primary/50 transition-colors"
            >
              <h2 className="text-lg font-semibold text-text-primary">{locale === 'he' ? c.titleHe : c.titleEn}</h2>
              <p className="text-sm text-text-secondary mt-1">{locale === 'he' ? c.descHe : c.descEn}</p>
              <p className="text-xs text-text-secondary mt-2">
                {locale === 'he' ? `${moduleCount} מודולים · ${lessonCount} שיעורים` : `${moduleCount} modules · ${lessonCount} lessons`}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
