import { OlympiadForm } from "@/components/admin/olympiad-form";
import { createOlympiad } from "../actions";

export default function NewOlympiadPage() {
  return (
    <div>
      <h1 className="mb-6 font-sans text-2xl font-bold text-foreground">नया ओलंपियाड जोड़ें</h1>
      <OlympiadForm action={createOlympiad} />
    </div>
  );
}
