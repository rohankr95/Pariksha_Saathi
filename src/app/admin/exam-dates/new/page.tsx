import { ExamForm } from "@/components/admin/exam-form";
import { createExam } from "../actions";

export default function NewExamPage() {
  return (
    <div>
      <h1 className="mb-6 font-sans text-2xl font-bold text-foreground">नई परीक्षा जोड़ें</h1>
      <ExamForm action={createExam} />
    </div>
  );
}
