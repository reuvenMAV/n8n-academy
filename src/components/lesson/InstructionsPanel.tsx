'use client';

export function InstructionsPanel({ instructions, estimatedMin }: { instructions: string; estimatedMin?: number }) {
  return (
    <div className="rounded-lg border border-white/10 bg-surface p-4 overflow-auto max-h-[60vh]">
      <h2 className="text-lg font-semibold text-text-primary mb-2">הוראות</h2>
      <div className="text-sm text-text-secondary whitespace-pre-wrap break-words">{instructions}</div>
      {estimatedMin != null && (
        <p className="text-xs text-text-secondary mt-2">~{estimatedMin} min</p>
      )}
    </div>
  );
}
