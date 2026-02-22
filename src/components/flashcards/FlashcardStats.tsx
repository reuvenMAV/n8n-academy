'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Flame, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ActivityCalendar } from 'react-activity-calendar';

interface Stats {
  totalCards: number;
  dueToday: number;
  streak: number;
  masteredCards: number;
}

interface HistoryDay {
  date: string;
  count: number;
  level: number;
}

export function FlashcardStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [reviewHistory, setReviewHistory] = useState<HistoryDay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/flashcards/stats')
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch('/api/flashcards/history')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setReviewHistory(data);
      })
      .catch(() => {});
  }, []);

  if (loading || !stats) return null;

  return (
    <div className="rounded-lg border border-white/10 bg-surface p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-text-primary flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          כרטיסיות לחזרה היום
        </h3>
        {stats.streak > 3 && (
          <span className="text-primary" title="רצף ימים">
            <Flame className="w-5 h-5" />
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-primary mb-1">{stats.dueToday}</p>
      <p className="text-xs text-text-muted mb-3">
        {stats.masteredCards} שולט • {stats.totalCards} סה&quot;כ
      </p>
      {reviewHistory.length > 0 && (
        <div className="mb-3 [&_.react-activity-calendar]:!max-w-full">
          <ActivityCalendar
            data={reviewHistory}
            colorScheme="dark"
            theme={{
              dark: ['#1A1A2E', '#0F2A1A', '#00994A', '#00CC63', '#00FF94'],
            }}
            labels={{
              legend: { less: 'פחות', more: 'יותר' },
              totalCount: '{{count}} כרטיסיות ב-{{year}}',
            }}
          />
        </div>
      )}
      <Link href="/review">
        <Button variant="outline" size="sm" className="w-full">
          חזרה יומית 🗂️
        </Button>
      </Link>
    </div>
  );
}
