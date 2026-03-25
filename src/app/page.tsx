import { auth, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CreateSessionForm, JoinSessionForm } from "./dashboard-forms";
import { ThemeToggle } from "./theme-toggle";

export default async function Home() {
  const authSession = await auth();
  if (!authSession?.user?.id) redirect("/login");

  const userId = authSession.user.id;

  const sessions = await prisma.session.findMany({
    where: { members: { some: { userId } } },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { throws: true } },
      owner: { select: { name: true } },
    },
  });

  return (
    <div className="flex-1 flex flex-col max-w-lg mx-auto w-full p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-10">
          <form action={async () => { "use server"; await signOut({ redirectTo: "/login" }); }}>
            <button className="text-sm text-gray-500 dark:text-gray-400">Esci</button>
          </form>
        </div>
        <h1 className="text-xl font-bold">🏐 Dodgeball</h1>
        <ThemeToggle />
      </div>

      <p className="text-gray-500 dark:text-gray-400">Ciao, {authSession.user.name || authSession.user.email}!</p>

      <CreateSessionForm />
      <JoinSessionForm />

      <h2 className="font-semibold text-lg">Le tue sessioni</h2>
      {sessions.length === 0 && <p className="text-gray-500">Nessuna sessione ancora.</p>}
      <div className="space-y-2">
        {sessions.map((s) => (
          <Link key={s.id} href={`/session/${s.id}`}
            className="block p-4 rounded-lg bg-gray-100 border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
            <div className="font-semibold">{s.name}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {s._count.throws} tiri · di {s.owner.name || "?"} · codice: {s.shareCode}
            </div>
          </Link>
        ))}
      </div>

      <Link href="/stats" className="block text-center p-3 rounded-lg bg-gray-100 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 font-semibold">
        📊 Statistiche
      </Link>
    </div>
  );
}
