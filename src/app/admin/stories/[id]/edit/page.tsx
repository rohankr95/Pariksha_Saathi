import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StoryForm } from "@/components/admin/story-form";
import { updateStory } from "../../actions";

export default async function EditStoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const story = await prisma.story.findUnique({ where: { id } });
  if (!story) notFound();

  return (
    <div>
      <h1 className="mb-6 font-sans text-2xl font-bold text-foreground">कहानी संपादित करें</h1>
      <StoryForm initial={story} action={updateStory.bind(null, id)} />
    </div>
  );
}
