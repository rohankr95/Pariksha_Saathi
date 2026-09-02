import { StoryForm } from "@/components/admin/story-form";
import { createStory } from "../actions";

export default function NewStoryPage() {
  return (
    <div>
      <h1 className="mb-6 font-sans text-2xl font-bold text-foreground">नई कहानी जोड़ें</h1>
      <StoryForm action={createStory} />
    </div>
  );
}
