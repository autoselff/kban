export const dynamic = "force-dynamic";

export default async function Home() {
  const { listUsers } = await import("../data/users");
  const formatter = new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  const users = await listUsers(10).catch(() => undefined);

  return (
    <main className="shell">
      <div className="hero">
        <p className="eyebrow">Next.js + Prisma 8</p>
        <h1>Users from your database, loaded on the server</h1>
      </div>

      <section className="panel">
        <div className="panelHeader">
          <code>Seeded users</code>
          <code>{users?.length ?? 0} total</code>
        </div>

        {!users ? (
          <p className="empty">
            Could not query users yet. Run <code>contract:emit</code> and apply
            your schema, then refresh.
          </p>
        ) : users.length === 0 ? (
          <p className="empty">No users found.</p>
        ) : (
          <ul className="users">
            {users.map((user) => (
              <li key={user.id}>
                <div>
                  <strong>{user.name ?? "Unnamed user"}</strong>
                  <p>{user.username ? `@${user.username}` : user.email}</p>
                </div>
                {user.createdAt ? (
                  <time dateTime={user.createdAt.toISOString()}>
                    {formatter.format(user.createdAt)}
                  </time>
                ) : (
                  <span className="empty">No timestamp</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
