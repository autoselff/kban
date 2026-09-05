"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "./db";

export type Card = {
  id: string;
  title: string;
  description: string;
  columnId: string;
  order: number;
};

export type Column = {
  id: string;
  title: string;
  order: number;
  cards: Card[];
};

export type Board = {
  id: string;
  title: string;
  columns: Column[];
};

function mapBoard(
  board: {
    id: number;
    title: string;
    columns: {
      id: number;
      title: string;
      order: number;
      cards: {
        id: number;
        title: string;
        description: string;
        columnId: number;
        columnOrder: number;
      }[];
    }[];
  },
): Board {
  return {
    id: String(board.id),
    title: board.title,
    columns: board.columns.map((column) => ({
      id: String(column.id),
      title: column.title,
      order: column.order,
      cards: column.cards.map((card) => ({
        id: String(card.id),
        title: card.title,
        description: card.description,
        columnId: String(card.columnId),
        order: card.columnOrder,
      })),
    })),
  };
}

const boardInclude = {
  columns: {
    orderBy: { order: "asc" as const },
    include: { cards: { orderBy: { columnOrder: "asc" as const } } },
  },
};

async function ensureBoard() {
  const existing = await prisma.board.findFirst({ include: boardInclude });
  if (existing) return existing;

  await prisma.board.create({
    data: {
      title: "Project board",
      columns: {
        create: [
          {
            title: "To do",
            order: 0,
            cards: {
              create: [
                {
                  title: "Define Prisma models",
                  description: "Board, Column, Card",
                  columnOrder: 0,
                },
              ],
            },
          },
          {
            title: "In progress",
            order: 1,
            cards: {
              create: [
                {
                  title: "Kanban UI",
                  description: "Columns, cards, drag and drop",
                  columnOrder: 0,
                },
              ],
            },
          },
          { title: "Done", order: 2 },
        ],
      },
    },
  });

  return prisma.board.findFirstOrThrow({ include: boardInclude });
}

export async function getBoard(): Promise<Board> {
  return mapBoard(await ensureBoard());
}

export async function updateBoard(
  id: string,
  data: { title: string },
) {
  await prisma.board.update({ where: { id: Number(id) }, data });
  revalidatePath("/");
}

export async function addColumn(title: string) {
  const board = await prisma.board.findFirstOrThrow();
  const last = await prisma.column.findFirst({
    where: { boardId: board.id },
    orderBy: { order: "desc" },
  });
  const column = await prisma.column.create({
    data: { title, order: (last?.order ?? -1) + 1, boardId: board.id },
  });
  revalidatePath("/");
  return String(column.id);
}

export async function addCard(
  columnId: string,
  title: string,
  description: string,
) {
  const colId = Number(columnId);
  const last = await prisma.card.findFirst({
    where: { columnId: colId },
    orderBy: { columnOrder: "desc" },
  });
  const card = await prisma.card.create({
    data: {
      title,
      description,
      columnId: colId,
      columnOrder: (last?.columnOrder ?? -1) + 1,
    },
  });
  revalidatePath("/");
  return String(card.id);
}

export async function updateCard(
  id: string,
  data: { title: string; description: string },
) {
  await prisma.card.update({ where: { id: Number(id) }, data });
  revalidatePath("/");
}

export async function moveCard(
  id: string,
  toColumnId: string,
  toIndex: number,
) {
  const cardId = Number(id);
  const destId = Number(toColumnId);

  await prisma.$transaction(async (tx) => {
    const card = await tx.card.findUniqueOrThrow({ where: { id: cardId } });
    const fromId = card.columnId;

    const from = await tx.card.findMany({
      where: { columnId: fromId },
      orderBy: { columnOrder: "asc" },
    });
    const to =
      fromId === destId
        ? from
        : await tx.card.findMany({
            where: { columnId: destId },
            orderBy: { columnOrder: "asc" },
          });

    const fromRest = from.filter((c) => c.id !== cardId);
    const dest = (fromId === destId ? fromRest : to.filter((c) => c.id !== cardId));
    dest.splice(toIndex, 0, card);

    const touched = new Map(from.concat(to).map((c) => [c.id, c]));
    let temp = -1;
    for (const c of touched.values()) {
      await tx.card.update({
        where: { id: c.id },
        data: { columnOrder: temp-- },
      });
    }

    if (fromId !== destId) {
      for (let i = 0; i < fromRest.length; i++) {
        await tx.card.update({
          where: { id: fromRest[i].id },
          data: { columnId: fromId, columnOrder: i },
        });
      }
    }
    for (let i = 0; i < dest.length; i++) {
      await tx.card.update({
        where: { id: dest[i].id },
        data: { columnId: destId, columnOrder: i },
      });
    }
  });

  revalidatePath("/");
}
