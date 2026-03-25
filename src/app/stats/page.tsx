import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { parseStatuses, calcAccuracy } from "@/lib/statuses";
import { StatsChart } from "./chart";

export default async function StatsPage() {
  const authSession = await auth();
  if (!authSession?.user?.id) redirect("/login");

  const userId = authSession.user.id;

  const sessions = await prisma.session.findMany({
    where: { members: { some: { userId } } },
    orderBy: { createdAt: "asc" },
    include: {
      throws: { where: { userId }, orderBy: { createdAt: "asc" } },
    },
  });

  const chartData = sessions.map((s) => {
    const statuses = parseStatuses(s.statuses);
    const total = s.throws.length;
    const accuracy = calcAccuracy(statuses, s.throws);
    return {
      name: s.name,
      date: s.createdAt.toISOString().slice(0, 10),
      accuracy,
      total,
    };
  });

  const totalThrows = sessions.reduce((a, s) => a + s.throws.length, 0);
  const allParsed = sessions.map((s) => ({ statuses: parseStatuses(s.statuses), throws: s.throws }));
  const weightedSum = allParsed.reduce((acc, { statuses, throws }) => {
    const wm = Object.fromEntries(statuses.map((s) => [s.name, s.weight]));
    return acc + throws.reduce((a, t) => a + (wm[t.status] ?? 0), 0);
  }, 0);
  const overallAccuracy = totalThrows > 0 ? Math.round((weightedSum / totalThrows) * 100) : 0;

  return (
    <div className="flex-1 flex flex-col max-w-lg mx-auto w-full p-4 space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/" className="text-2xl">←</Link>
        <h1 className="text-xl font-bold">📊 Statistiche</h1>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="p-3 rounded-lg bg-gray-800">
          <div className="text-2xl font-bold">{overallAccuracy}%</div>
          <div className="text-xs text-gray-400">Accuracy</div>
        </div>
        <div className="p-3 rounded-lg bg-gray-800">
          <div className="text-2xl font-bold">{totalThrows}</div>
          <div className="text-xs text-gray-400">Tiri</div>
        </div>
        <div className="p-3 rounded-lg bg-gray-800">
          <div className="text-2xl font-bold">{sessions.length}</div>
          <div className="text-xs text-gray-400">Sessioni</div>
        </div>
      </div>

      <StatsChart data={chartData} />

      <div className="space-y-2">
        <h2 className="font-semibold">Dettaglio sessioni</h2>
        {chartData.map((d, i) => (
          <div key={i} className="flex justify-between p-3 rounded-lg bg-gray-800 text-sm">
            <div>
              <div className="font-semibold">{d.name}</div>
              <div className="text-gray-400">{d.date}</div>
            </div>
            <div className="text-right">
              <div className="font-bold">{d.accuracy}%</div>
              <div className="text-gray-400">{d.accuracy}% su {d.total}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
