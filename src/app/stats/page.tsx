import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { parseStatuses } from "@/lib/statuses";
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
    const hits = s.throws.filter((t) => t.status === statuses[0]?.name).length;
    return {
      name: s.name,
      date: s.createdAt.toISOString().slice(0, 10),
      accuracy: total > 0 ? Math.round((hits / total) * 100) : 0,
      total,
      hits,
    };
  });

  const allThrows = sessions.flatMap((s) => s.throws);
  const totalThrows = allThrows.length;
  const totalHits = sessions.reduce((acc, s) => {
    const first = parseStatuses(s.statuses)[0]?.name;
    return acc + s.throws.filter((t) => t.status === first).length;
  }, 0);
  const overallAccuracy = totalThrows > 0 ? Math.round((totalHits / totalThrows) * 100) : 0;

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
              <div className="text-gray-400">{d.hits}/{d.total}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
