'use client';

import { useTranslations } from 'next-intl';

export function InstructionsPanel({ instructions, estimatedMin }: { instructions: string; estimatedMin?: number }) {
  const t = useTranslations('lesson');
  return (
    <div className="rounded-lg border border-white/10 bg-surface p-4">
      <h2 className="text-lg font-semibold text-text-primary mb-2">{t('instructions')}</h2>
      <p className="text-sm text-text-secondary whitespace-pre-wrap">{instructions}</p>
      {estimatedMin != null && (
        <p className="text-xs text-text-secondary mt-2">~{estimatedMin} min</p>
      )}
    </div>
  );
}
