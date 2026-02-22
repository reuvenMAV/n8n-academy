'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export type FlashcardItem = {
  id: string;
  lessonSlug?: string;
  front: string;
  frontEn: string;
  back: string;
  backEn: string;
  type: string;
};

export function FlashcardCard({
  card,
  lang = 'he',
  flipped: controlledFlipped,
  onShowAnswer,
  compact,
}: {
  card: FlashcardItem;
  lang?: 'he' | 'en';
  flipped?: boolean;
  onShowAnswer?: () => void;
  onFlip?: (flipped: boolean) => void;
  compact?: boolean;
}) {
  const [internalFlipped, setInternalFlipped] = useState(false);
  const flipped = controlledFlipped ?? internalFlipped;
  const front = lang === 'he' ? card.front : card.frontEn;
  const back = lang === 'he' ? card.back : card.backEn;

  function handleClick() {
    const next = !flipped;
    if (controlledFlipped === undefined) setInternalFlipped(next);
    if (next) onShowAnswer?.();
  }

  return (
    <div
      className={`relative w-full cursor-pointer ${compact ? 'max-w-md h-52' : 'max-w-lg h-64 mx-auto'}`}
      style={{ perspective: 1000 }}
      onClick={handleClick}
    >
      <motion.div
        className="absolute inset-0 bg-[#1A1A2E] border border-[#00D4FF] rounded-xl p-6 flex flex-col items-center justify-center text-center"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.4 }}
        style={{ backfaceVisibility: 'hidden' }}
      >
        <span className="text-xs bg-[#FF6D5A] text-white px-2 py-1 rounded mb-3">{card.type}</span>
        {card.lessonSlug && (
          <span className="text-xs text-[#9090A0] mb-2">{card.lessonSlug}</span>
        )}
        <p className="text-[#F0F0F0] text-lg leading-relaxed flex-1 flex items-center justify-center" dir={lang === 'he' ? 'rtl' : 'ltr'}>
          {front}
        </p>
        <p className="text-[#9090A0] text-xs mt-2">לחץ להפוך • Space</p>
      </motion.div>

      <motion.div
        className="absolute inset-0 bg-[#0F0F23] border border-[#FFD93D] rounded-xl p-6 flex flex-col items-center justify-center text-center"
        animate={{ rotateY: flipped ? 0 : -180 }}
        transition={{ duration: 0.4 }}
        style={{ backfaceVisibility: 'hidden' }}
      >
        <span className="text-xs text-[#9090A0] mb-2">{lang === 'he' ? 'תשובה' : 'Answer'}</span>
        {card.type === 'expression' || card.type === 'code' ? (
          <code className="bg-black text-[#00FF94] p-4 rounded text-sm font-mono w-full text-left overflow-auto max-h-full">
            {back}
          </code>
        ) : (
          <p className="text-[#F0F0F0] text-lg leading-relaxed flex-1 flex items-center justify-center overflow-auto" dir={lang === 'he' ? 'rtl' : 'ltr'}>
            {back}
          </p>
        )}
      </motion.div>
    </div>
  );
}
