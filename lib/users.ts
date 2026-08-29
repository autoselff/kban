"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "./db";

export async function addUser() {
  await prisma.user.create({
    data: { email: `user-${Date.now()}@oarch.local`, name: "New" },
  });
  revalidatePath("/");
}

export async function removeUser() {
  const last = await prisma.user.findFirst({ orderBy: { id: "desc" } });
  if (!last) return;
  await prisma.user.delete({ where: { id: last.id } });
  revalidatePath("/");
}
