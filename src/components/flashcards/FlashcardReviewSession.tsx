'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import toast from 'react-hot-toast';
import { FlashcardCard, type FlashcardItem } from './FlashcardCard';
import { Button } from '@/components/ui/button';

const XP_PER_CARD = 5;
const RATING_LABELS_HE = { 0: 'שוב', 1: 'קשה', 2: 'טוב', 3: 'קל' } as const;
const RATING_INTERVALS_HE = { 0: 'מחר', 1: '3 ימים', 2: '7 ימים', 3: '14 ימים' } as const;
const RATING_INTERVALS_EN = { 0: 'Tomorrow', 1: '3 days', 2: '7 days', 3: '14 days' } as const;

export function FlashcardReviewSession({
  onComplete,
  cramMode = false,
  initialUrl = '/api/flashcards/review',
}: {
  onComplete?: () => void;
  cramMode?: boolean;
  initialUrl?: string;
}) {
  const [cards, setCards] = useState<FlashcardItem[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [lang, setLang] = useState<'he' | 'en'>('he');

  useEffect(() => {
    setLoading(true);
    setIndex(0);
    setFlipped(false);
    setSessionComplete(false);
    const url = initialUrl || '/api/flashcards/review';
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setCards(data.cards ?? []);
        setLoading(false);
      })
      .catch(() => {
        toast.error('Failed to load cards');
        setLoading(false);
      });
  }, [initialUrl]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !flipped) {
        e.preventDefault();
        setFlipped(true);
        return;
      }
      if (flipped && cards[index]) {
        if (e.key === '1') { e.preventDefault(); submitRating(0); }
        if (e.key === '2') { e.preventDefault(); submitRating(1); }
        if (e.key === '3') { e.preventDefault(); submitRating(2); }
        if (e.key === '4') { e.preventDefault(); submitRating(3); }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [flipped, index, cards]);

  async function submitRating(rating: 0 | 1 | 2 | 3) {
    const card = cards[index];
    if (!card) return;
    try {
      await fetch('/api/flashcards/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardId: card.id, rating }),
      });
    } catch {
      toast.error('Failed to save');
      return;
    }
    if (index >= cards.length - 1) {
      setSessionComplete(true);
      setShowConfetti(true);
      toast.success('סיימת את החזרה היומית! 🎉');
      setTimeout(() => setShowConfetti(false), 5000);
      const xpGain = cramMode ? 0 : cards.length * XP_PER_CARD;
      if (xpGain > 0) toast.success(`+${xpGain} XP`);
      onComplete?.();
    } else {
      setIndex((i) => i + 1);
      setFlipped(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-text-muted">
        טוען כרטיסיות...
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center gap-4">
        <p className="text-xl text-text-primary">אין כרטיסיות לחזרה היום 🎉</p>
        <p className="text-text-muted">חזרה הבאה</p>
        {onComplete && <Button onClick={onComplete}>חזרה</Button>}
      </div>
    );
  }

  if (sessionComplete) {
    return (
      <>
        {showConfetti && <Confetti recycle={false} numberOfPieces={300} />}
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center gap-4">
          <p className="text-2xl text-text-primary font-bold">{t('sessionComplete')}</p>
          <p className="text-text-muted">{cards.length} כרטיסיות נבדקו</p>
          {onComplete && <Button onClick={onComplete}>חזרה לדשבורד</Button>}
        </div>
      </>
    );
  }

  const card = cards[index];
  const progress = index + 1;
  const total = cards.length;

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          className="text-sm text-text-muted hover:text-text-primary"
          onClick={() => setLang((l) => (l === 'he' ? 'en' : 'he'))}
        >
          {lang === 'he' ? 'English' : 'עברית'}
        </button>
        <div className="flex-1 mx-4 h-2 bg-surface rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(progress / total) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <span className="text-sm text-text-muted">
          {progress} / {total}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="flex-1 flex flex-col"
        >
          <FlashcardCard
            card={card}
            lang={lang}
            flipped={flipped}
            onShowAnswer={() => setFlipped(true)}
          />
          <div className="mt-6 flex flex-wrap gap-2 justify-center">
            {([0, 1, 2, 3] as const).map((r) => (
              <Button
                key={r}
                variant={r === 0 ? 'destructive' : r === 3 ? 'default' : 'outline'}
                size="sm"
                className={r === 1 ? 'border-orange-500 text-orange-400' : r === 2 ? 'border-green-500 text-green-400' : ''}
                onClick={() => submitRating(r)}
                disabled={!flipped}
              >
                {t(RATING_LABELS[r])} {lang === 'he' ? RATING_INTERVALS_HE[r] : RATING_INTERVALS_EN[r]}
              </Button>
            ))}
          </div>
          <p className="text-xs text-[#9090A0] mt-2 text-center">
            מקשי קיצור: Space להיפוך | 1-4 לדירוג
          </p>
          {!flipped && (
            <p className="text-center text-sm text-text-muted mt-1">הצג תשובה ←</p>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
