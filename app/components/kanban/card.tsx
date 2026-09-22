"use client";

import { useEffect, useState } from "react";
import type { Card as CardType } from "@/lib/kanban";

export default function Card({
  card,
  dragging,
  onUpdate,
  onDelete,
  onDragStart,
  onDragEnd,
}: {
  card: CardType;
  dragging: boolean;
  onUpdate: (data: { title: string; description: string }) => void;
  onDelete: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description);
  const [badgeColor, setBadgeColor] = useState(card.badgeColor ?? "#2dd4bf");
  const [badgeEnabled, setBadgeEnabled] = useState(card.badgeColor !== null);

  function close() {
    setTitle(card.title);
    setDescription(card.description);
    setBadgeColor(card.badgeColor ?? "#2dd4bf");
    setBadgeEnabled(card.badgeColor !== null);
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
      className={`card${dragging ? " dragging" : ""}`}
      style={
        card.badgeColor
          ? { borderLeft: `5px solid ${card.badgeColor}` }
          : undefined
      }
      draggable={!editing}
      onDragStart={(e) => {
        e.stopPropagation();
        e.dataTransfer.setData("text/plain", `card:${card.id}`);
        e.dataTransfer.effectAllowed = "move";
        onDragStart();
      }}
      onDragEnd={onDragEnd}
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
              onUpdate({
                title: nextTitle,
                description: description.trim(),
                badgeColor: badgeEnabled ? badgeColor : null,
              });
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
            <label className="badgePicker">
              <input
                type="checkbox"
                checked={badgeEnabled}
                onChange={(e) => setBadgeEnabled(e.target.checked)}
              />
              <span className="checkboxMark" aria-hidden="true" />
              Badge
              <input
                type="color"
                value={badgeColor}
                disabled={!badgeEnabled}
                onChange={(e) => setBadgeColor(e.target.value)}
                aria-label="Badge color"
              />
            </label>
            <div className="cardActions">
              <button type="submit">Save</button>
              <button type="button" onClick={close}>
                Cancel
              </button>
              <button
                type="button"
                className="deleteCard"
                onClick={() => {
                  if (confirm("Delete this card?")) onDelete();
                }}
              >
                Delete
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </article>
  );
}
