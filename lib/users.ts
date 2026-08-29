"use server";
import { prisma } from "./db";

export async function addUser() {
  await prisma.user.create({
    data: { email: `user-${Date.now()}@oarch.local`, name: "New" },
  });
}
