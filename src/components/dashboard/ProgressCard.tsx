'use client';

import Link from 'next/link';

type ProgressItem = { lessonId: string; completed: boolean; lesson: { titleEn: string; titleHe?: string } };

export function ProgressCard({ progress }: { progress: ProgressItem[] }) {
  const completed = progress.filter((p) => p.completed);
  return (
    <div className="rounded-lg border border-white/10 bg-surface p-4">
      <h2 className="text-lg font-semibold text-text-primary mb-2">Progress</h2>
      <ul className="space-y-1">
        {completed.slice(0, 5).map((p) => (
          <li key={p.lessonId} className="text-sm text-text-secondary flex items-center gap-2">
            <span className="text-success">✓</span>
            {p.lesson.titleHe ?? p.lesson.titleEn}
          </li>
        ))}
      </ul>
      {completed.length === 0 && <p className="text-sm text-text-secondary">No lessons completed yet.</p>}
    </div>
  );
}
