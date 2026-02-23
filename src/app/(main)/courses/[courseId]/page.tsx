import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';

export default async function CoursePage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const locale = 'he';
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: { modules: { orderBy: { order: 'asc' }, include: { lessons: { orderBy: { order: 'asc' } } } } },
  });
  if (!course) notFound();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text-primary">{locale === 'he' ? course.titleHe : course.titleEn}</h1>
      <p className="text-text-secondary">{locale === 'he' ? course.descHe : course.descEn}</p>
      <div className="space-y-6">
        {course.modules.map((mod, modIdx) => (
          <div key={mod.id} className="rounded-lg border border-white/10 bg-surface p-4">
            <h2 className="text-lg font-semibold text-text-primary">
              {locale === 'he' ? mod.titleHe : mod.titleEn}
              <span className="text-sm font-normal text-text-secondary mr-2">
                ({mod.lessons.length} {locale === 'he' ? 'שיעורים' : 'lessons'})
              </span>
            </h2>
            <ul className="mt-3 space-y-1.5">
              {mod.lessons.map((les, lesIdx) => (
                <li key={les.id}>
                  <Link
                    href={`/courses/${courseId}/${les.id}`}
                    className="text-primary hover:underline flex items-center gap-2"
                  >
                    <span className="text-text-secondary tabular-nums">{lesIdx + 1}.</span>
                    {locale === 'he' ? les.titleHe : les.titleEn}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
