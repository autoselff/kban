"use client";

import { Fragment, useState } from "react";
import {
  addCard as addCardAction,
  addColumn as addColumnAction,
  deleteColumn as deleteColumnAction,
  moveCard as moveCardAction,
  moveColumn as moveColumnAction,
  updateBoard as updateBoardAction,
  updateCard as updateCardAction,
  type Board,
} from "@/lib/kanban";
import AddColumn from "./add-column";
import Column from "./column";

type Drag =
  | { type: "card"; id: string }
  | { type: "column"; id: string };

type Over =
  | { type: "card"; columnId: string; index: number }
  | { type: "column"; index: number };

function midIndex(client: number, els: Element[], axis: "x" | "y") {
  const i = [...els].findIndex((el) => {
    const r = el.getBoundingClientRect();
    return client < (axis === "x" ? r.left + r.width / 2 : r.top + r.height / 2);
  });
  return i === -1 ? els.length : i;
}

export default function KanbanBoard({ initial }: { initial: Board }) {
  const [board, setBoard] = useState(initial);
  const [title, setTitle] = useState(initial.title);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [over, setOver] = useState<Over | null>(null);

  function saveTitle() {
    const next = title.trim();
    if (!next || next === board.title) {
      setTitle(board.title);
      return;
    }
    setBoard({ ...board, title: next });
    updateBoardAction(board.id, { title: next });
  }

  async function addColumn(nextTitle: string) {
    const id = await addColumnAction(nextTitle);
    setBoard((board) => ({
      ...board,
      columns: [
        ...board.columns,
        { id, title: nextTitle, order: board.columns.length, cards: [] },
      ],
    }));
  }

  function deleteColumn(id: string) {
    setBoard({
      ...board,
      columns: board.columns.filter((column) => column.id !== id),
    });
    deleteColumnAction(id);
  }

  async function addCard(columnId: string, cardTitle: string) {
    const id = await addCardAction(columnId, cardTitle, "");
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
                  title: cardTitle,
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
    if (sameColumn && insertAt === fromIndex) return;

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

  function moveColumn(columnId: string, toIndex: number) {
    const fromIndex = board.columns.findIndex((c) => c.id === columnId);
    if (fromIndex < 0) return;
    const insertAt = fromIndex < toIndex ? toIndex - 1 : toIndex;
    if (insertAt === fromIndex) return;

    const columns = board.columns.filter((c) => c.id !== columnId);
    const col = board.columns[fromIndex];
    columns.splice(insertAt, 0, col);
    setBoard({
      ...board,
      columns: columns.map((c, order) => ({ ...c, order })),
    });
    moveColumnAction(columnId, insertAt);
  }

  function endDrag() {
    setDrag(null);
    setOver(null);
  }

  const colOver = drag?.type === "column" && over?.type === "column" ? over.index : null;

  return (
    <>
      <div className="hero">
        <p className="eyebrow">kban</p>
        <input
          className="boardTitle"
          value={title}
          aria-label="Board name"
          onChange={(e) => setTitle(e.target.value)}
          onBlur={saveTitle}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
            if (e.key === "Escape") {
              setTitle(board.title);
              e.currentTarget.blur();
            }
          }}
        />
      </div>
      <div
        className="board"
        onDragOver={(e) => {
          if (drag?.type !== "column") return;
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";
          setOver({
            type: "column",
            index: midIndex(
              e.clientX,
              e.currentTarget.querySelectorAll("[data-column]"),
              "x",
            ),
          });
        }}
        onDrop={(e) => {
          e.preventDefault();
          if (drag?.type !== "column" || over?.type !== "column") return;
          moveColumn(drag.id, over.index);
          endDrag();
        }}
      >
        {board.columns.map((column, i) => (
          <Fragment key={column.id}>
            {colOver === i ? <div className="dropCol" /> : null}
            <Column
              column={column}
              dragging={drag?.type === "column" && drag.id === column.id}
              draggingCardId={drag?.type === "card" ? drag.id : null}
              dropIndex={
                drag?.type === "card" &&
                over?.type === "card" &&
                over.columnId === column.id
                  ? over.index
                  : null
              }
              onAddCard={(cardTitle) => addCard(column.id, cardTitle)}
              onUpdateCard={updateCard}
              onDelete={() => deleteColumn(column.id)}
              onCardDragStart={(id) => setDrag({ type: "card", id })}
              onColumnDragStart={() => setDrag({ type: "column", id: column.id })}
              onCardOver={(index) =>
                setOver({ type: "card", columnId: column.id, index })
              }
              onDropCard={(cardId, toIndex) => {
                moveCard(cardId, column.id, toIndex);
                endDrag();
              }}
              onDragEnd={endDrag}
            />
          </Fragment>
        ))}
        {colOver === board.columns.length ? <div className="dropCol" /> : null}
        <AddColumn onAdd={addColumn} />
      </div>
    </>
  );
}
