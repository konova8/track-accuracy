"use client";

import { createSession, joinSession } from "@/lib/actions/session";
import { useRouter } from "next/navigation";
import { useState } from "react";

const COLORS = [
  { value: "green", label: "🟢", bg: "bg-green-600" },
  { value: "red", label: "🔴", bg: "bg-red-600" },
  { value: "yellow", label: "🟡", bg: "bg-yellow-600" },
  { value: "blue", label: "🔵", bg: "bg-blue-600" },
  { value: "gray", label: "⚪", bg: "bg-gray-600" },
];

type StatusEntry = { name: string; color: string };

export function CreateSessionForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [statuses, setStatuses] = useState<StatusEntry[]>([
    { name: "Hit", color: "green" },
    { name: "Miss", color: "red" },
  ]);

  function addStatus() {
    setStatuses([...statuses, { name: "", color: "gray" }]);
  }

  function removeStatus(i: number) {
    setStatuses(statuses.filter((_, idx) => idx !== i));
  }

  function updateStatus(i: number, field: keyof StatusEntry, value: string) {
    const next = [...statuses];
    next[i] = { ...next[i], [field]: value };
    setStatuses(next);
  }

  async function handleCreate(formData: FormData) {
    const encoded = statuses
      .filter((s) => s.name.trim())
      .map((s) => `${s.name.trim()}:${s.color}`)
      .join(",");
    formData.set("statuses", encoded);
    const id = await createSession(formData);
    router.push(`/session/${id}`);
  }

  if (!open)
    return (
      <button onClick={() => setOpen(true)} className="w-full p-3 rounded-lg bg-blue-600 font-semibold">
        + Nuova sessione
      </button>
    );

  return (
    <form action={handleCreate} className="space-y-3 p-4 rounded-lg bg-gray-800 border border-gray-700">
      <input name="name" placeholder="Nome sessione" required className="w-full p-2 rounded bg-gray-900 border border-gray-600" />

      <div className="space-y-2">
        <label className="text-sm text-gray-400">Stati</label>
        {statuses.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              value={s.name}
              onChange={(e) => updateStatus(i, "name", e.target.value)}
              placeholder="Nome stato"
              className="flex-1 p-2 rounded bg-gray-900 border border-gray-600 text-sm"
            />
            <div className="flex gap-1">
              {COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => updateStatus(i, "color", c.value)}
                  className={`w-8 h-8 rounded text-sm ${s.color === c.value ? "ring-2 ring-white" : "opacity-40"}`}
                >
                  {c.label}
                </button>
              ))}
            </div>
            {statuses.length > 1 && (
              <button type="button" onClick={() => removeStatus(i)} className="text-red-400 text-lg px-1">×</button>
            )}
          </div>
        ))}
        <button type="button" onClick={addStatus} className="text-sm text-blue-400">+ Aggiungi stato</button>
      </div>

      <div className="flex gap-2">
        <button type="submit" className="flex-1 p-2 rounded bg-blue-600 font-semibold">Crea</button>
        <button type="button" onClick={() => setOpen(false)} className="p-2 rounded bg-gray-700">Annulla</button>
      </div>
    </form>
  );
}

export function JoinSessionForm() {
  const router = useRouter();

  async function handleJoin(formData: FormData) {
    const id = await joinSession(formData);
    router.push(`/session/${id}`);
  }

  return (
    <form action={handleJoin} className="flex gap-2">
      <input name="code" placeholder="Codice sessione" required className="flex-1 p-3 rounded-lg bg-gray-800 border border-gray-700" />
      <button type="submit" className="p-3 rounded-lg bg-green-600 font-semibold">Unisciti</button>
    </form>
  );
}
