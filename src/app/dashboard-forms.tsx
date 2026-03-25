"use client";

import { createSession, joinSession } from "@/lib/actions/session";
import { useRouter } from "next/navigation";
import { useState } from "react";

const COLORS = [
  { value: "green", label: "🟢" },
  { value: "red", label: "🔴" },
  { value: "yellow", label: "🟡" },
  { value: "blue", label: "🔵" },
  { value: "gray", label: "⚪" },
];

const WEIGHTS = [
  { value: 1, label: "✅ Successo" },
  { value: 0.5, label: "⚡ Parziale" },
  { value: 0, label: "❌ Fallimento" },
];

type StatusEntry = { name: string; color: string; weight: number };

export function CreateSessionForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [statuses, setStatuses] = useState<StatusEntry[]>([
    { name: "Hit", color: "green", weight: 1 },
    { name: "Miss", color: "red", weight: 0 },
  ]);

  function addStatus() {
    setStatuses([...statuses, { name: "", color: "gray", weight: 0 }]);
  }

  function removeStatus(i: number) {
    setStatuses(statuses.filter((_, idx) => idx !== i));
  }

  function update(i: number, field: keyof StatusEntry, value: string | number) {
    const next = [...statuses];
    next[i] = { ...next[i], [field]: value };
    setStatuses(next);
  }

  async function handleCreate(formData: FormData) {
    const encoded = statuses
      .filter((s) => s.name.trim())
      .map((s) => `${s.name.trim()}:${s.color}:${s.weight}`)
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

      <div className="space-y-3">
        <label className="text-sm text-gray-400">Stati</label>
        {statuses.map((s, i) => (
          <div key={i} className="space-y-1 p-2 rounded bg-gray-900 border border-gray-700">
            <div className="flex items-center gap-2">
              <input
                value={s.name}
                onChange={(e) => update(i, "name", e.target.value)}
                placeholder="Nome stato"
                className="flex-1 p-2 rounded bg-gray-800 border border-gray-600 text-sm"
              />
              {statuses.length > 1 && (
                <button type="button" onClick={() => removeStatus(i)} className="text-red-400 text-lg px-1">×</button>
              )}
            </div>
            <div className="flex items-center gap-1">
              {COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => update(i, "color", c.value)}
                  className={`w-7 h-7 rounded text-sm ${s.color === c.value ? "ring-2 ring-white" : "opacity-40"}`}
                >
                  {c.label}
                </button>
              ))}
              <span className="mx-1 text-gray-600">|</span>
              {WEIGHTS.map((w) => (
                <button
                  key={w.value}
                  type="button"
                  onClick={() => update(i, "weight", w.value)}
                  className={`px-2 py-1 rounded text-xs ${s.weight === w.value ? "bg-gray-600 ring-1 ring-white" : "bg-gray-800 opacity-50"}`}
                >
                  {w.label}
                </button>
              ))}
            </div>
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
