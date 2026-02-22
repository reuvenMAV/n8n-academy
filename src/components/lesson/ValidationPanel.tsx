'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import type { ValidationRule } from '@/lib/canvas/validationEngine';

type Result = {
  passed: boolean;
  score: number;
  results: { ruleId: string; passed: boolean; feedbackHe: string; feedbackEn: string; hint?: string }[];
};

export function ValidationPanel({
  validationRules,
  result,
  onValidate,
}: {
  validationRules: ValidationRule[];
  result: Result | null;
  onValidate: (r: Result | null) => void;
  lessonId: string;
  userId: string | null;
}) {
  const t = useTranslations('lesson');
  const locale = 'he';
  const feedbackKey = locale === 'he' ? 'feedbackHe' : 'feedbackEn';

  if (validationRules.length === 0) return null;

  function handleValidate() {
    window.dispatchEvent(new CustomEvent('workflow-validate'));
  }

  return (
    <div className="rounded-lg border border-white/10 bg-surface p-4">
      <h2 className="text-lg font-semibold text-text-primary mb-2">{t('validate')}</h2>
      <Button onClick={handleValidate} size="sm">
        Check solution
      </Button>
      {result && (
        <div className="mt-3 space-y-2">
          <p className="text-sm font-medium">
            {t('score')}: {result.score}% {result.passed ? '✓' : ''}
          </p>
          <ul className="text-xs text-text-secondary space-y-1">
            {result.results.map((r) => (
              <li key={r.ruleId}>
                {r.passed ? '✓' : '✗'} {locale === 'he' ? r.feedbackHe : r.feedbackEn}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
