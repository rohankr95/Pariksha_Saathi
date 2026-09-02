import type { StudentAnswer } from "@/lib/quiz-scoring";

/** Shape stored in QuizAttempt.answersJson while an attempt is in progress. */
export type AttemptState = {
  questionOrder: string[];
  optionOrder: Record<string, number[]>; // questionId -> shuffled list of original option indices
  answers: Record<string, StudentAnswer>;
  markedForReview: string[];
};

/** A question with correctAnswer stripped and options shuffled — safe to send to the client pre-submit. */
export type ClientQuestion = {
  id: string;
  type: string;
  textHi: string;
  textEn: string | null;
  imageUrl: string | null;
  options: string[] | null; // already reordered per this attempt's optionOrder
  marks: number;
};
