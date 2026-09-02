import { InterestQuiz } from "@/components/career/interest-quiz";

export const metadata = { title: "रुचि परीक्षण | परीक्षा साथी" };

export default function CareerQuizPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-1 text-center font-sans text-2xl font-bold text-foreground">
        करियर रुचि परीक्षण
      </h1>
      <p className="mb-6 text-center text-sm text-muted-foreground">
        10 सरल प्रश्नों के आधार पर आपके लिए सबसे उपयुक्त करियर रोडमैप सुझाए जाएँगे
      </p>
      <InterestQuiz />
    </div>
  );
}
