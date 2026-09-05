"use client";

import type { Column as ColumnType } from "@/lib/kanban";
import AddCard from "./add-card";
import Card from "./card";

export default function Column({
  column,
  onAddCard,
  onUpdateCard,
  onDelete,
  onDropCard,
}: {
  column: ColumnType;
  onAddCard: (title: string) => void;
  onUpdateCard: (
    cardId: string,
    data: { title: string; description: string },
  ) => void;
  onDelete: () => void;
  onDropCard: (cardId: string, toIndex: number) => void;
}) {
  return (
    <section
      className="column"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const cardId = e.dataTransfer.getData("text/plain");
        if (cardId) onDropCard(cardId, column.cards.length);
      }}
    >
      <div className="panelHeader">
        <h2>{column.title}</h2>
        <code>{column.cards.length}</code>
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
          <div
            key={card.id}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const cardId = e.dataTransfer.getData("text/plain");
              if (cardId) onDropCard(cardId, index);
            }}
          >
            <Card
              card={card}
              onUpdate={(data) => onUpdateCard(card.id, data)}
            />
          </div>
        ))}
      </div>

      <AddCard onAdd={onAddCard} />
    </section>
  );
}
