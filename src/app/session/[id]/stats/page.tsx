import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { parseStatuses, calcAccuracy } from "@/lib/statuses";
import { ThrowsChart } from "@/app/stats/throws-chart";

export default async function SessionStatsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const authSession = await auth();
  if (!authSession?.user?.id) redirect("/login");

  const session = await prisma.session.findUnique({
    where: { id },
    include: {
      throws: { orderBy: { createdAt: "asc" } },
      members: { include: { user: { select: { id: true, name: true, email: true } } } },
    },
  });

  if (!session) redirect("/");
  const userId = authSession.user.id;
  if (!session.members.some((m) => m.userId === userId)) redirect("/");

  const statuses = parseStatuses(session.statuses);
  const myThrows = session.throws.filter((t) => t.userId === userId);
  const accuracy = calcAccuracy(statuses, myThrows);
  const counts: Record<string, number> = {};
  statuses.forEach((s) => (counts[s.name] = myThrows.filter((t) => t.status === s.name).length));

  const colorMap = Object.fromEntries(statuses.map((s) => [s.name, s.color]));
  const throwsData = myThrows.map((t) => ({
    status: t.status,
    color: colorMap[t.status] || "gray",
    time: t.createdAt.toISOString(),
    session: session.name,
  }));

  return (
    <div className="flex-1 flex flex-col max-w-lg mx-auto w-full p-4 space-y-6">
      <div className="flex items-center gap-2">
        <Link href={`/session/${id}`} className="text-2xl">←</Link>
        <h1 className="text-xl font-bold flex-1">📊 {session.name}</h1>
      </div>

      <div className="grid grid-cols-2 gap-3 text-center">
        <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800">
          <div className="text-3xl font-bold">{accuracy}%</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Accuracy</div>
        </div>
        <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800">
          <div className="text-3xl font-bold">{myThrows.length}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Tiri totali</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {statuses.map((s) => (
          <div key={s.name} className="flex justify-between p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm">
            <span>{s.name}</span>
            <span className="font-bold">{counts[s.name] || 0}</span>
          </div>
        ))}
      </div>

      <ThrowsChart data={throwsData} />
    </div>
  );
}
