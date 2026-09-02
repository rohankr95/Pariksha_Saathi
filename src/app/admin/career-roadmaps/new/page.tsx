import { RoadmapForm } from "@/components/admin/roadmap-form";
import { createRoadmap } from "../actions";

export default function NewRoadmapPage() {
  return (
    <div>
      <h1 className="mb-6 font-sans text-2xl font-bold text-foreground">नया रोडमैप जोड़ें</h1>
      <RoadmapForm action={createRoadmap} />
    </div>
  );
}
