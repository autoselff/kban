"use client";

import { useState } from "react";

export default function AddColumn({
  onAdd,
}: {
  onAdd: (title: string) => void;
}) {
  const [title, setTitle] = useState("");

  return (
    <form
      className="column addColumn"
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
        placeholder="New column"
        aria-label="New column title"
      />
      <button type="submit">Add column</button>
    </form>
  );
}
