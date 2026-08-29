import { prisma, seed } from "../lib/db";
import AddUserButton from "./components/buttons/add-user-button";
import ExampleButton from "./components/buttons/add-user-button";

export const dynamic = "force-dynamic";

const formatter = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default async function Home() {
  await seed();
  const users = await prisma.user.findMany({ take: 10, orderBy: { id: "asc" } });

  return (
    <main className="shell">
      <div className="hero">
        <p className="eyebrow">Next.js + Prisma</p>
        <h1>Users from your database, loaded on the server</h1>
      </div>

      <section className="panel">
        <div className="panelHeader">
          <code>Seeded users</code>
          <code>{users.length} total</code>
        </div>
        <ul className="users">
          {users.map((user) => (
            <li key={user.id}>
              <div>
                <strong>{user.name || "Unnamed user"}</strong>
                <p>{user.username ? `@${user.username}` : user.email}</p>
              </div>
              <time dateTime={user.createdAt.toISOString()}>
                {formatter.format(user.createdAt)}
              </time>
            </li>
          ))}
        </ul>

        <AddUserButton />
      </section>
    </main>
  );
}
