"use client";

import { useState } from "react";
import {
  addCard as addCardAction,
  addColumn as addColumnAction,
  moveCard as moveCardAction,
  updateBoard as updateBoardAction,
  updateCard as updateCardAction,
  type Board,
} from "@/lib/kanban";
import AddColumn from "./add-column";
import Column from "./column";

export default function KanbanBoard({ initial }: { initial: Board }) {
  const [board, setBoard] = useState(initial);

  function updateTitle(el: HTMLElement) {
    const title = (el.textContent ?? "").trim();
    if (!title || title === board.title) {
      el.textContent = board.title;
      return;
    }
    setBoard({ ...board, title });
    updateBoardAction(board.id, { title });
  }

  async function addColumn(title: string) {
    const id = await addColumnAction(title);
    setBoard((board) => ({
      ...board,
      columns: [
        ...board.columns,
        { id, title, order: board.columns.length, cards: [] },
      ],
    }));
  }

  async function addCard(columnId: string, title: string) {
    const id = await addCardAction(columnId, title, "");
    setBoard((board) => ({
      ...board,
      columns: board.columns.map((column) =>
        column.id !== columnId
          ? column
          : {
              ...column,
              cards: [
                ...column.cards,
                {
                  id,
                  title,
                  description: "",
                  columnId,
                  order: column.cards.length,
                },
              ],
            },
      ),
    }));
  }

  function updateCard(
    cardId: string,
    data: { title: string; description: string },
  ) {
    setBoard({
      ...board,
      columns: board.columns.map((column) => ({
        ...column,
        cards: column.cards.map((card) =>
          card.id === cardId ? { ...card, ...data } : card,
        ),
      })),
    });
    updateCardAction(cardId, data);
  }

  function moveCard(cardId: string, toColumnId: string, toIndex: number) {
    const from = board.columns.find((column) =>
      column.cards.some((card) => card.id === cardId),
    );
    const card = from?.cards.find((item) => item.id === cardId);
    if (!from || !card) return;

    const sameColumn = from.id === toColumnId;
    const fromIndex = from.cards.findIndex((item) => item.id === cardId);
    const insertAt =
      sameColumn && fromIndex < toIndex ? toIndex - 1 : toIndex;

    setBoard({
      ...board,
      columns: board.columns.map((column) => {
        let cards = column.cards.filter((item) => item.id !== cardId);
        if (column.id === toColumnId) {
          cards = [
            ...cards.slice(0, insertAt),
            { ...card, columnId: toColumnId },
            ...cards.slice(insertAt),
          ];
        }
        return {
          ...column,
          cards: cards.map((item, order) => ({ ...item, order })),
        };
      }),
    });
    moveCardAction(cardId, toColumnId, insertAt);
  }

  return (
    <>
      <div className="hero">
        <p className="eyebrow">kban</p>
        <h1
          className="boardTitle"
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => updateTitle(e.currentTarget)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              e.currentTarget.blur();
            }
            if (e.key === "Escape") {
              e.currentTarget.textContent = board.title;
              e.currentTarget.blur();
            }
          }}
        >
          {board.title}
        </h1>
      </div>
      <div className="board">
        {board.columns.map((column) => (
          <Column
            key={column.id}
            column={column}
            onAddCard={(title) => addCard(column.id, title)}
            onUpdateCard={updateCard}
            onDropCard={(cardId, toIndex) =>
              moveCard(cardId, column.id, toIndex)
            }
          />
        ))}
        <AddColumn onAdd={addColumn} />
      </div>
    </>
  );
}
