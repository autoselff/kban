"use client";

import { useEffect, useState } from "react";
import type { Card as CardType } from "@/lib/kanban";

export default function Card({
  card,
  onUpdate,
}: {
  card: CardType;
  onUpdate: (data: { title: string; description: string }) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description);

  function close() {
    setTitle(card.title);
    setDescription(card.description);
    setEditing(false);
  }

  useEffect(() => {
    if (!editing) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editing, card.title, card.description]);

  return (
    <article
      className="card"
      draggable={!editing}
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", card.id);
        e.dataTransfer.effectAllowed = "move";
      }}
    >
      <button type="button" className="cardBody" onClick={() => setEditing(true)}>
        <strong>{card.title}</strong>
        {card.description ? <p>{card.description}</p> : null}
      </button>

      {editing ? (
        <div className="modalBackdrop" onClick={close}>
          <form
            className="modal"
            onClick={(e) => e.stopPropagation()}
            onSubmit={(e) => {
              e.preventDefault();
              const nextTitle = title.trim();
              if (!nextTitle) return;
              onUpdate({ title: nextTitle, description: description.trim() });
              setEditing(false);
            }}
          >
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              aria-label="Card title"
              autoFocus
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              aria-label="Card description"
              rows={5}
            />
            <div className="cardActions">
              <button type="submit">Save</button>
              <button type="button" onClick={close}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </article>
  );
}
