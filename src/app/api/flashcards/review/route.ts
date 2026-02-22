import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { calculateNextReview } from '@/lib/sm2';

export const dynamic = 'force-dynamic';

const NEW_CARDS_PER_DAY = 10;
const MAX_DUE_PER_SESSION = 20;

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const { searchParams } = new URL(request.url);
  const cram = searchParams.get('cram') === 'true';
  const lessonIdParam = searchParams.get('lessonId');

  if (cram) {
    const where = lessonIdParam ? { lessonId: lessonIdParam } : {};
    const allCards = await prisma.flashcard.findMany({
      where,
      include: { lesson: true },
      take: 50,
    });
    const cards = allCards.map((c) => ({
      id: c.id,
      lessonId: c.lessonId,
      lessonSlug: c.lesson.slug,
      front: c.front,
      frontEn: c.frontEn,
      back: c.back,
      backEn: c.backEn,
      type: c.type,
      interval: 1,
      repetitions: 0,
      easeFactor: 2.5,
      nextReview: new Date().toISOString(),
    }));
    return NextResponse.json({ cards, total: cards.length });
  }

  const now = new Date();
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);

  const reviews = await prisma.flashcardReview.findMany({
    where: { userId: user.id, nextReview: { lte: endOfToday } },
    include: { card: { include: { lesson: true } } },
    orderBy: { nextReview: 'asc' },
    take: MAX_DUE_PER_SESSION,
  });

  const dueCards = reviews.map((r) => ({
    id: r.card.id,
    lessonId: r.card.lessonId,
    lessonSlug: r.card.lesson.slug,
    front: r.card.front,
    frontEn: r.card.frontEn,
    back: r.card.back,
    backEn: r.card.backEn,
    type: r.card.type,
    interval: r.interval,
    repetitions: r.repetitions,
    easeFactor: r.easeFactor,
    nextReview: r.nextReview.toISOString(),
  }));

  if (dueCards.length >= MAX_DUE_PER_SESSION) {
    return NextResponse.json({ cards: dueCards, total: dueCards.length });
  }

  const reviewedCardIds = new Set(reviews.map((r) => r.cardId));
  const needNew = Math.min(NEW_CARDS_PER_DAY, MAX_DUE_PER_SESSION - dueCards.length);
  const newCards = await prisma.flashcard.findMany({
    where: { id: { notIn: Array.from(reviewedCardIds) } },
    include: { lesson: true },
    take: needNew * 2,
  });
  const toAdd = newCards.slice(0, needNew);
  const newCardsPayload = toAdd.map((c) => ({
    id: c.id,
    lessonId: c.lessonId,
    lessonSlug: c.lesson.slug,
    front: c.front,
    frontEn: c.frontEn,
    back: c.back,
    backEn: c.backEn,
    type: c.type,
    interval: 1,
    repetitions: 0,
    easeFactor: 2.5,
    nextReview: now.toISOString(),
  }));

  const allCards = [...dueCards, ...newCardsPayload].slice(0, MAX_DUE_PER_SESSION);
  return NextResponse.json({ cards: allCards, total: allCards.length });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const body = await request.json();
  const { cardId, rating } = body as { cardId: string; rating: 0 | 1 | 2 | 3 };
  if (cardId == null || rating == null || ![0, 1, 2, 3].includes(rating)) {
    return NextResponse.json({ error: 'cardId and rating (0-3) required' }, { status: 400 });
  }

  const card = await prisma.flashcard.findUnique({ where: { id: cardId } });
  if (!card) return NextResponse.json({ error: 'Card not found' }, { status: 404 });

  let review = await prisma.flashcardReview.findUnique({
    where: { userId_cardId: { userId: user.id, cardId } },
  });

  const state = {
    interval: review?.interval ?? 1,
    repetitions: review?.repetitions ?? 0,
    easeFactor: review?.easeFactor ?? 2.5,
    nextReview: review?.nextReview ?? new Date(),
  };
  const next = calculateNextReview(state, rating);
  const nextReviewDate = new Date(next.nextReview);

  const xpPerCard = 5;
  if (review) {
    await prisma.flashcardReview.update({
      where: { id: review.id },
      data: {
        interval: next.interval,
        repetitions: next.repetitions,
        easeFactor: next.easeFactor,
        nextReview: nextReviewDate,
        lastRating: rating,
        reviewedAt: new Date(),
      },
    });
  } else {
    await prisma.flashcardReview.create({
      data: {
        userId: user.id,
        cardId,
        interval: next.interval,
        repetitions: next.repetitions,
        easeFactor: next.easeFactor,
        nextReview: nextReviewDate,
        lastRating: rating,
      },
    });
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayMs = today.getTime();
  const yesterdayMs = todayMs - 86400000;
  const lastReviewDate = user.lastReviewDate;
  const lastMs = lastReviewDate ? new Date(lastReviewDate).setHours(0, 0, 0, 0) : 0;

  if (lastMs < yesterdayMs || lastMs === 0) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        xp: user.xp + xpPerCard,
        flashcardStreak: 1,
        lastReviewDate: new Date(),
      },
    });
  } else if (lastMs === yesterdayMs) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        xp: user.xp + xpPerCard,
        flashcardStreak: { increment: 1 },
        lastReviewDate: new Date(),
      },
    });
  } else {
    await prisma.user.update({
      where: { id: user.id },
      data: { xp: user.xp + xpPerCard },
    });
  }

  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);
  const dueCount = await prisma.flashcardReview.count({
    where: {
      userId: user.id,
      nextReview: { lte: endOfToday },
    },
  });

  return NextResponse.json({
    nextReview: nextReviewDate.toISOString(),
    interval: next.interval,
    cardsRemaining: Math.max(0, dueCount - 1),
  });
}
