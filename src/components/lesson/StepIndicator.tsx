'use client';

export function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`w-2 h-2 rounded-full ${i <= current ? 'bg-primary' : 'bg-white/20'}`}
        />
      ))}
    </div>
  );
}
