'use client';

import { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FlashcardReviewSession } from '@/components/flashcards/FlashcardReviewSession';

export default function ReviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [cramMode, setCramMode] = useState(false);
  const initialUrl = useMemo(() => {
    const base = '/api/flashcards/review';
    if (cramMode) {
      const params = new URLSearchParams({ cram: 'true' });
      const lessonId = searchParams.get('lessonId');
      if (lessonId) params.set('lessonId', lessonId);
      return `${base}?${params.toString()}`;
    }
    return base;
  }, [cramMode, searchParams]);

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text-primary">כרטיסיות חזרה</h1>
        <button
          type="button"
          onClick={() => setCramMode((prev) => !prev)}
          className={`px-3 py-1 rounded text-sm border transition-colors ${
            cramMode
              ? 'border-[#FF6D5A] text-[#FF6D5A] bg-[#2A1A17]'
              : 'border-[#9090A0] text-[#9090A0]'
          }`}
        >
          {cramMode ? '🔥 מצב הצפה פעיל' : 'מצב הצפה (Cram)'}
        </button>
      </div>
      <FlashcardReviewSession
        onComplete={() => router.push('/dashboard')}
        cramMode={cramMode}
        initialUrl={initialUrl}
      />
    </div>
  );
}
