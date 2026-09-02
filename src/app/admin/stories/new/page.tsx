import { StoryForm } from "@/components/admin/story-form";
import { createStory } from "../actions";
import { getT } from "@/lib/i18n/server";

export default async function NewStoryPage() {
  const t = await getT();
  return (
    <div>
      <h1 className="mb-6 font-sans text-2xl font-bold text-foreground">{t("stories.admin.newTitle")}</h1>
      <StoryForm action={createStory} />
    </div>
  );
}
