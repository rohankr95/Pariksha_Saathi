import type { QuestionType } from "@prisma/client";

/**
 * All answers/correctAnswer values reference the ORIGINAL (unshuffled)
 * option indices — the client maps a shuffled click back to the original
 * index before it's ever sent to the server, so scoring never needs to know
 * about the shuffle. This also means correctAnswer must stay server-side
 * until submission: the client only ever receives shuffled option *text*.
 */
export type StudentAnswer = number | number[] | boolean | string | null;

export function isCorrect(type: QuestionType, correctAnswer: unknown, answer: StudentAnswer): boolean {
  if (answer === null || answer === undefined) return false;

  switch (type) {
    case "MCQ_SINGLE":
    case "ASSERTION_REASON":
      return Number(answer) === Number(correctAnswer);

    case "TRUE_FALSE":
      return Boolean(answer) === Boolean(correctAnswer);

    case "MCQ_MULTIPLE": {
      const correct = Array.isArray(correctAnswer) ? [...correctAnswer].map(Number).sort() : [];
      const given = Array.isArray(answer) ? [...answer].map(Number).sort() : [];
      return correct.length === given.length && correct.every((v, i) => v === given[i]);
    }

    case "NUMERIC": {
      const target = Number(correctAnswer);
      const given = Number(answer);
      if (Number.isNaN(target) || Number.isNaN(given)) return false;
      return Math.abs(target - given) < 1e-6;
    }

    default:
      return false;
  }
}

export type ScoredQuestion = {
  questionId: string;
  marks: number;
  negativeMarks: number;
  answer: StudentAnswer;
  correct: boolean;
  attempted: boolean;
};

export function scoreAttempt(
  questions: { id: string; type: QuestionType; marks: number; correctAnswer: unknown }[],
  answers: Record<string, StudentAnswer>,
  negativeMarksPerQuestion: number
): { score: number; correctCount: number; attemptedCount: number; accuracy: number; details: ScoredQuestion[] } {
  const details: ScoredQuestion[] = questions.map((q) => {
    const answer = answers[q.id] ?? null;
    const attempted = answer !== null && answer !== undefined && !(Array.isArray(answer) && answer.length === 0);
    const correct = attempted && isCorrect(q.type, q.correctAnswer, answer);
    return { questionId: q.id, marks: q.marks, negativeMarks: negativeMarksPerQuestion, answer, correct, attempted };
  });

  const score = details.reduce((sum, d) => {
    if (!d.attempted) return sum;
    return sum + (d.correct ? d.marks : -d.negativeMarks);
  }, 0);

  const attemptedCount = details.filter((d) => d.attempted).length;
  const correctCount = details.filter((d) => d.correct).length;
  const accuracy = attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0;

  return { score: Math.round(score * 100) / 100, correctCount, attemptedCount, accuracy, details };
}

/** Fisher–Yates shuffle, pure (does not mutate input). */
export function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
