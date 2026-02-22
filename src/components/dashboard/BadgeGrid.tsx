'use client';

type BadgeItem = { key: string; titleEn: string; titleHe?: string; icon: string };

export function BadgeGrid({ badges }: { badges: BadgeItem[] }) {
  return (
    <div className="rounded-lg border border-white/10 bg-surface p-4">
      <h2 className="text-lg font-semibold text-text-primary mb-2">Badges</h2>
      <div className="flex flex-wrap gap-2">
        {badges.length === 0 ? (
          <p className="text-sm text-text-secondary">No badges yet. Complete lessons to earn badges!</p>
        ) : (
          badges.map((b) => (
            <div
              key={b.key}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background/50 border border-white/10"
              title={b.titleHe ?? b.titleEn}
            >
              <span>{b.icon}</span>
              <span className="text-sm text-text-primary">{b.titleHe ?? b.titleEn}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
