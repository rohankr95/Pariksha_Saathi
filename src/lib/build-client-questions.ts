import type { Question } from "@prisma/client";
import type { AttemptState, ClientQuestion } from "@/lib/quiz-types";

/** Reorders questions per the attempt's shuffle and strips correctAnswer/explanation — safe for the client. */
export function buildClientQuestions(questions: Question[], state: AttemptState): ClientQuestion[] {
  const byId = new Map(questions.map((q) => [q.id, q]));

  return state.questionOrder
    .map((id) => byId.get(id))
    .filter((q): q is Question => Boolean(q))
    .map((q) => {
      const rawOptions = Array.isArray(q.optionsJson) ? q.optionsJson.map(String) : null;
      const order = state.optionOrder[q.id];
      const options = rawOptions && order ? order.map((origIdx) => rawOptions[origIdx]) : rawOptions;
      return {
        id: q.id,
        type: q.type,
        textHi: q.textHi,
        textEn: q.textEn,
        imageUrl: q.imageUrl,
        options,
        marks: q.marks,
      };
    });
}

/** Maps a shuffled-position click back to the original option index, for scoring. */
export function shuffledIndexToOriginal(optionOrder: number[] | undefined, shuffledIndex: number): number {
  if (!optionOrder) return shuffledIndex;
  return optionOrder[shuffledIndex] ?? shuffledIndex;
}
