import { PrismaClient } from "@prisma/client";

const g = globalThis as unknown as { prisma?: PrismaClient };
export const prisma = g.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") g.prisma = prisma;

const users = [
  { email: "alice@prisma.io", username: "alice", name: "Alice" },
  { email: "bob@prisma.io", username: "bob", name: "Bob" },
  { email: "carol@prisma.io", username: "carol", name: "Carol" },
];

let seeded: Promise<void> | undefined;

export function seed() {
  if (!seeded) {
    seeded = (async () => {
      for (const u of users) {
        await prisma.user.upsert({
          where: { email: u.email },
          create: u,
          update: {},
        });
      }
    })();
  }
  return seeded;
}
