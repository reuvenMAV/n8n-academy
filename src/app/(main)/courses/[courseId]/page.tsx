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
      <div className="space-y-4">
        {course.modules.map((mod) => (
          <div key={mod.id} className="rounded-lg border border-white/10 bg-surface p-4">
            <h2 className="text-lg font-semibold text-text-primary">{locale === 'he' ? mod.titleHe : mod.titleEn}</h2>
            <ul className="mt-2 space-y-1">
              {mod.lessons.map((les) => (
                <li key={les.id}>
                  <Link
                    href={`/courses/${courseId}/${les.id}`}
                    className="text-primary hover:underline"
                  >
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
