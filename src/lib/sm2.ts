// Standard SM-2 spaced repetition algorithm
// rating: 0=Again, 1=Hard, 2=Good, 3=Easy

export interface SM2State {
  interval: number;
  repetitions: number;
  easeFactor: number;
  nextReview: Date;
}

export function calculateNextReview(state: SM2State, rating: 0 | 1 | 2 | 3): SM2State {
  let { interval, repetitions, easeFactor } = state;

  if (rating === 0) {
    interval = 1;
    repetitions = 0;
  } else {
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 6;
    else interval = Math.round(interval * easeFactor);

    repetitions += 1;
    easeFactor = Math.max(1.3, easeFactor + 0.1 - (3 - rating) * (0.08 + (3 - rating) * 0.02));
  }

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);

  return { interval, repetitions, easeFactor, nextReview };
}
