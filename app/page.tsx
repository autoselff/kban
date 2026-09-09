import Boards from "./components/boards";
import { listBoards } from "@/lib/kanban";

export const dynamic = "force-dynamic";

export default async function Home() {
  const boards = await listBoards();

  return (
    <main className="shell boardShell" suppressHydrationWarning>
      <div className="hero boardBar">
        <p className="eyebrow">kban</p>
        <h1 className="boardTitle">Boards</h1>
      </div>
      <Boards initial={boards} />
    </main>
  );
}
