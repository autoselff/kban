"use client";

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
    data: { title: string; description: string },
  ) => void;
  onDelete: () => void;
  onCardDragStart: (id: string) => void;
  onColumnDragStart: () => void;
  onCardOver: (index: number) => void;
  onDropCard: (cardId: string, toIndex: number) => void;
  onDragEnd: () => void;
}) {
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
        <h2>{column.title}</h2>
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
