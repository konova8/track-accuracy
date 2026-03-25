import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ThrowTracker } from "./tracker";

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

  const isMember = session.members.some((m) => m.userId === authSession.user!.id);
  if (!isMember) redirect("/");

  const userId = authSession.user.id;
  const statuses = session.statuses.split(",").map((s) => s.trim());
  const myThrows = session.throws.filter((t) => t.userId === userId);
  const counts: Record<string, number> = {};
  statuses.forEach((s) => (counts[s] = myThrows.filter((t) => t.status === s).length));
  const total = myThrows.length;
  const hitCount = counts[statuses[0]] || 0;
  const accuracy = total > 0 ? Math.round((hitCount / total) * 100) : 0;

  return (
    <div className="flex-1 flex flex-col max-w-lg mx-auto w-full p-4 space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/" className="text-2xl">←</Link>
        <h1 className="text-xl font-bold flex-1">{session.name}</h1>
        <span className="text-xs bg-gray-700 px-2 py-1 rounded">{session.shareCode}</span>
      </div>

      <div className="text-center space-y-1">
        <div className="text-5xl font-bold">{accuracy}%</div>
        <div className="text-gray-400">{total} tiri totali</div>
        <div className="flex justify-center gap-4 text-sm">
          {statuses.map((s) => (
            <span key={s}>{s}: {counts[s] || 0}</span>
          ))}
        </div>
      </div>

      <ThrowTracker sessionId={session.id} statuses={statuses} />

      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-gray-400">Partecipanti</h3>
        {session.members.map((m) => (
          <div key={m.id} className="text-sm">{m.user.name || m.user.email}</div>
        ))}
      </div>

      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-gray-400">Ultimi tiri</h3>
        {myThrows.slice(0, 20).map((t) => (
          <div key={t.id} className="text-xs text-gray-500 flex justify-between">
            <span>{t.status}</span>
            <span>{new Date(t.createdAt).toLocaleTimeString("it-IT")}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
