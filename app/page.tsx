import KanbanBoard from "./components/kanban/board";
import { getBoard } from "@/lib/kanban";

export const dynamic = "force-dynamic";

export default async function Home() {
  const board = await getBoard();

  return (
    <main className="shell boardShell">
      <KanbanBoard initial={board} />
    </main>
  );
}
