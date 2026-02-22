'use client';

export function StreakCard({ streak }: { streak: number }) {
  return (
    <div className="rounded-lg border border-white/10 bg-surface p-4">
      <h2 className="text-lg font-semibold text-text-primary mb-2">Streak</h2>
      <p className="text-2xl font-bold text-primary">{streak} days</p>
      <p className="text-sm text-text-secondary mt-1">Keep learning every day to build your streak!</p>
    </div>
  );
}
