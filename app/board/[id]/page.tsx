import { notFound } from "next/navigation";
import KanbanBoard from "../../components/kanban/board";
import { getBoard } from "@/lib/kanban";

export const dynamic = "force-dynamic";

export default async function BoardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  try {
    const board = await getBoard(id);
    return (
      <main className="shell boardShell" suppressHydrationWarning>
        <KanbanBoard initial={board} />
      </main>
    );
  } catch {
    notFound();
  }
}
