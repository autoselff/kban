import { PrismaClient } from "@prisma/client";

const g = globalThis as unknown as { __kbanPrisma?: PrismaClient };

function makePrisma() {
  const client = new PrismaClient();
  if (typeof client.board?.findFirst !== "function") {
    throw new Error("Prisma Client missing board model — run: npx prisma generate && restart next dev");
  }
  return client;
}

export const prisma = g.__kbanPrisma && typeof g.__kbanPrisma.board?.findFirst === "function" ? g.__kbanPrisma : makePrisma();
if (process.env.NODE_ENV !== "production") g.__kbanPrisma = prisma;
