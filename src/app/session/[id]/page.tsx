import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { parseStatuses, calcAccuracy } from "@/lib/statuses";
import { ThrowTracker, DeleteSessionButton } from "./tracker";

export default async function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const authSession = await auth();
  if (!authSession?.user?.id) redirect("/login");

  const session = await prisma.session.findUnique({
    where: { id },
    include: {
      throws: { orderBy: { createdAt: "desc" } },
      members: { include: { user: { select: { id: true, name: true, email: true } } } },
    },
  });

  if (!session) redirect("/");

  const userId = authSession.user.id;
  const isMember = session.members.some((m) => m.userId === userId);
  if (!isMember) redirect("/");

  const statuses = parseStatuses(session.statuses);
  const myThrows = session.throws.filter((t) => t.userId === userId);
  const counts: Record<string, number> = {};
  statuses.forEach((s) => (counts[s.name] = myThrows.filter((t) => t.status === s.name).length));
  const total = myThrows.length;
  const accuracy = calcAccuracy(statuses, myThrows);
  const isOwner = session.ownerId === userId;

  return (
    <div className="flex-1 flex flex-col max-w-lg mx-auto w-full p-4 space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/" className="text-2xl">←</Link>
        <h1 className="text-xl font-bold flex-1">{session.name}</h1>
        <span className="text-xs bg-gray-700 px-2 py-1 rounded">{session.shareCode}</span>
      </div>

      <ThrowTracker
        sessionId={session.id}
        statuses={statuses}
        initialCounts={counts}
        initialTotal={total}
        initialAccuracy={accuracy}
        initialThrows={myThrows.slice(0, 20).map((t) => ({
          id: t.id,
          status: t.status,
          time: t.createdAt.toISOString(),
        }))}
      />

      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-gray-400">Partecipanti</h3>
        {session.members.map((m) => (
          <div key={m.id} className="text-sm">{m.user.name || m.user.email}</div>
        ))}
      </div>

      {isOwner && <DeleteSessionButton sessionId={session.id} />}

      <Link href={`/session/${session.id}/stats`} className="block text-center p-3 rounded-lg bg-gray-800 border border-gray-700 font-semibold">
        📊 Statistiche sessione
      </Link>
    </div>
  );
}
