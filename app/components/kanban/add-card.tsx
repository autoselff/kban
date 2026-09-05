"use client";

import { useState } from "react";

export default function AddCard({
  onAdd,
}: {
  onAdd: (title: string) => void;
}) {
  const [title, setTitle] = useState("");

  return (
    <form
      className="addCard"
      onSubmit={(e) => {
        e.preventDefault();
        const next = title.trim();
        if (!next) return;
        onAdd(next);
        setTitle("");
      }}
    >
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="New card"
        aria-label="New card title"
      />
      <button type="submit">Add</button>
    </form>
  );
}
