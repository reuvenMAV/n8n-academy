'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FlashcardCard, type FlashcardItem } from './FlashcardCard';
import { Button } from '@/components/ui/button';

export function LessonEndQuiz({
  lessonId,
  onClose,
}: {
  lessonId: string;
  onClose: () => void;
}) {
  const [cards, setCards] = useState<FlashcardItem[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/flashcards/lesson/${lessonId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setCards(Array.isArray(data) ? data : data.cards ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [lessonId]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="text-text-muted">טוען כרטיסיות...</div>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
        <div className="bg-surface rounded-xl border border-white/10 p-6 max-w-sm text-center shadow-xl" onClick={(e) => e.stopPropagation()}>
          <p className="text-text-primary mb-4">אין כרטיסיות לשיעור זה.</p>
          <Button onClick={onClose}>סיים חזרה</Button>
        </div>
      </div>
    );
  }

  const card = cards[index];
  const isLast = index >= cards.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-surface rounded-xl border border-white/10 p-6 max-w-lg w-full shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-text-muted">
            חזרה קצרה ({index + 1} / {cards.length})
          </span>
          <button type="button" className="text-text-muted hover:text-text-primary" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-[200px]"
          >
            <FlashcardCard
              card={card}
              lang="he"
              flipped={flipped}
              onShowAnswer={() => setFlipped(true)}
              compact
            />
          </motion.div>
        </AnimatePresence>
        <div className="mt-4 flex gap-2 justify-end">
          {!flipped ? (
            <Button size="sm" onClick={() => setFlipped(true)}>
              הצג תשובה
            </Button>
          ) : (
            <>
              {!isLast && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => { setIndex((i) => i + 1); setFlipped(false); }}
                >
                  הבא
                </Button>
              )}
              <Button size="sm" onClick={onClose}>
                סיים חזרה
              </Button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
