"use client";

import { useEffect, useState } from "react";
import type { Column as ColumnType } from "@/lib/kanban";
import AddCard from "./add-card";
import Card from "./card";

function cardIndex(clientY: number, root: Element) {
  const items = [...root.querySelectorAll("[data-card]")];
  const i = items.findIndex((el) => {
    const r = el.getBoundingClientRect();
    return clientY < r.top + r.height / 2;
  });
  return i === -1 ? items.length : i;
}

export default function Column({
  column,
  dragging,
  draggingCardId,
  dropIndex,
  onAddCard,
  onUpdateCard,
  onDeleteCard,
  onUpdateColumn,
  onDelete,
  onCardDragStart,
  onColumnDragStart,
  onCardOver,
  onDropCard,
  onDragEnd,
}: {
  column: ColumnType;
  dragging: boolean;
  draggingCardId: string | null;
  dropIndex: number | null;
  onAddCard: (title: string) => void;
  onUpdateCard: (
    cardId: string,
    data: { title: string; description: string; badgeColor: string | null },
  ) => void;
  onDeleteCard: (cardId: string) => void;
  onUpdateColumn: (title: string) => void;
  onDelete: () => void;
  onCardDragStart: (id: string) => void;
  onColumnDragStart: () => void;
  onCardOver: (index: number) => void;
  onDropCard: (cardId: string, toIndex: number) => void;
  onDragEnd: () => void;
}) {
  const [title, setTitle] = useState(column.title);

  useEffect(() => setTitle(column.title), [column.title]);

  function saveTitle() {
    const next = title.trim();
    if (!next || next === column.title) {
      setTitle(column.title);
      return;
    }
    onUpdateColumn(next);
  }

  return (
    <section
      className={`column${dragging ? " dragging" : ""}${dropIndex != null ? " dragOver" : ""}`}
      data-column={column.id}
      onDragOver={(e) => {
        if (!draggingCardId) return;
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = "move";
        onCardOver(cardIndex(e.clientY, e.currentTarget));
      }}
      onDrop={(e) => {
        if (!draggingCardId) return;
        e.preventDefault();
        e.stopPropagation();
        onDropCard(draggingCardId, dropIndex ?? column.cards.length);
      }}
    >
      <div className="panelHeader">
        <button
          type="button"
          className="grip"
          aria-label="Move column"
          draggable
          onDragStart={(e) => {
            e.dataTransfer.setData("text/plain", `col:${column.id}`);
            e.dataTransfer.effectAllowed = "move";
            onColumnDragStart();
          }}
          onDragEnd={onDragEnd}
        >
          ⠿
        </button>
        <input
          className="columnTitle"
          value={title}
          aria-label="Column name"
          onChange={(e) => setTitle(e.target.value)}
          onBlur={saveTitle}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
            if (e.key === "Escape") {
              setTitle(column.title);
              e.currentTarget.blur();
            }
          }}
        />
        <button
          type="button"
          className="iconBtn"
          aria-label="Delete column"
          onClick={() => {
            if (confirm("Delete this column?")) onDelete();
          }}
        >
          ×
        </button>
      </div>

      <div className="cards">
        {column.cards.map((card, index) => (
          <div key={card.id} data-card={card.id}>
            {dropIndex === index ? <div className="dropLine" /> : null}
            <Card
              card={card}
              dragging={draggingCardId === card.id}
              onUpdate={(data) => onUpdateCard(card.id, data)}
              onDelete={() => onDeleteCard(card.id)}
              onDragStart={() => onCardDragStart(card.id)}
              onDragEnd={onDragEnd}
            />
          </div>
        ))}
        {dropIndex === column.cards.length ? <div className="dropLine" /> : null}
      </div>

      <AddCard onAdd={onAddCard} />
    </section>
  );
}
