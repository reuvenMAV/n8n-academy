'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLessonStore } from '@/store/lessonStore';
import { WorkflowCanvas } from '@/components/canvas/WorkflowCanvas';
import { InstructionsPanel } from '@/components/lesson/InstructionsPanel';
import { ValidationPanel } from '@/components/lesson/ValidationPanel';
import { VideoPlayer } from '@/components/lesson/VideoPlayer';
import { LessonEndQuiz } from '@/components/flashcards/LessonEndQuiz';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import type { ValidationRule } from '@/lib/canvas/validationEngine';

interface LessonLayoutProps {
  lessonId: string;
  courseId: string;
  titleHe: string;
  titleEn: string;
  type: string;
  instructions: string;
  videoUrl?: string;
  validationRules: ValidationRule[];
  hints: string[];
  starterTemplate: { nodes: unknown[]; edges: unknown[] } | null;
  xpReward: number;
  estimatedMin: number;
  userId: string | null;
}

export function LessonLayout({
  lessonId,
  courseId,
  titleHe,
  titleEn,
  type,
  instructions,
  videoUrl,
  validationRules,
  hints,
  starterTemplate,
  xpReward,
  estimatedMin,
  userId,
}: LessonLayoutProps) {
  const setCurrentLessonId = useLessonStore((s) => s.setCurrentLessonId);
  useEffect(() => {
    setCurrentLessonId(lessonId);
    return () => setCurrentLessonId(null);
  }, [lessonId, setCurrentLessonId]);
  const [validationResult, setValidationResult] = useState<{ passed: boolean; score: number; results: { ruleId: string; passed: boolean; feedbackHe: string; feedbackEn: string; hint?: string }[] } | null>(null);
  const [hintIndex, setHintIndex] = useState(-1);
  const [showQuiz, setShowQuiz] = useState(false);

  useEffect(() => {
    if (validationResult?.passed) setShowQuiz(true);
  }, [validationResult?.passed]);

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">
      <div className="flex items-center gap-2 mb-2">
<Link href={`/courses/${courseId}`}>
            <Button variant="ghost" size="sm">
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
        <h1 className="text-xl font-bold text-text-primary">{titleEn}</h1>
      </div>
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">
        <div className="lg:col-span-1 flex flex-col gap-2 overflow-auto">
          <InstructionsPanel instructions={instructions} estimatedMin={estimatedMin} />
          {videoUrl && <VideoPlayer url={videoUrl} />}
          <ValidationPanel
            validationRules={validationRules}
            result={validationResult}
            onValidate={setValidationResult}
            lessonId={lessonId}
            userId={userId}
          />
          {hints.length > 0 && (
            <div className="rounded-lg border border-white/10 bg-surface p-3">
              <p className="text-sm font-medium text-text-primary">רמז</p>
              <Button
                size="sm"
                variant="outline"
                className="mt-2"
                onClick={() => setHintIndex((i) => (i < hints.length - 1 ? i + 1 : i))}
              >
                Show hint {hintIndex >= 0 ? hintIndex + 1 : ''}
              </Button>
              {hintIndex >= 0 && <p className="text-sm text-text-secondary mt-2">{hints[hintIndex]}</p>}
            </div>
          )}
        </div>
        <div className="lg:col-span-2 min-h-[400px] rounded-lg border border-white/10 overflow-hidden">
          <WorkflowCanvas
            mode="learn"
            readOnly={false}
            initialNodes={starterTemplate?.nodes as never[] | undefined}
            initialEdges={starterTemplate?.edges as never[] | undefined}
            starterTemplate={starterTemplate as { nodes: Array<{ type?: string; position?: { x: number; y: number } }>; edges: unknown[] } | null}
            lessonId={lessonId}
            validationRules={validationRules}
            onValidateResult={setValidationResult}
            userId={userId}
          />
        </div>
      </div>
      {showQuiz && (
        <LessonEndQuiz lessonId={lessonId} onClose={() => setShowQuiz(false)} />
      )}
    </div>
  );
}
