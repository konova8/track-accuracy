"use client";

import { createSession, joinSession } from "@/lib/actions/session";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function CreateSessionForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function handleCreate(formData: FormData) {
    const id = await createSession(formData);
    router.push(`/session/${id}`);
  }

  if (!open) return (
    <button onClick={() => setOpen(true)} className="w-full p-3 rounded-lg bg-blue-600 font-semibold">
      + Nuova sessione
    </button>
  );

  return (
    <form action={handleCreate} className="space-y-2 p-4 rounded-lg bg-gray-800 border border-gray-700">
      <input name="name" placeholder="Nome sessione" required className="w-full p-2 rounded bg-gray-900 border border-gray-600" />
      <input name="statuses" placeholder="Stati (es: Hit,Miss)" defaultValue="Hit,Miss" className="w-full p-2 rounded bg-gray-900 border border-gray-600 text-sm" />
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
