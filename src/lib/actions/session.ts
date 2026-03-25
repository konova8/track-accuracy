"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { v4 as uuid } from "uuid";

async function getUser() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non autenticato");
  return session.user.id;
}

export async function createSession(formData: FormData) {
  const userId = await getUser();
  const name = formData.get("name") as string;
  const statuses = (formData.get("statuses") as string) || "Hit,Miss";

  const session = await prisma.session.create({
    data: {
      name,
      ownerId: userId,
      shareCode: uuid().slice(0, 8),
      statuses,
      members: { create: { userId } },
    },
  });

  revalidatePath("/");
  return session.id;
}

export async function joinSession(formData: FormData) {
  const userId = await getUser();
  const code = formData.get("code") as string;

  const session = await prisma.session.findUnique({ where: { shareCode: code } });
  if (!session) throw new Error("Sessione non trovata");

  await prisma.sessionMember.upsert({
    where: { sessionId_userId: { sessionId: session.id, userId } },
    update: {},
    create: { sessionId: session.id, userId },
  });

  revalidatePath("/");
  return session.id;
}

export async function recordThrow(sessionId: string, status: string) {
  const userId = await getUser();
  await prisma.throw.create({ data: { sessionId, userId, status } });
  revalidatePath(`/session/${sessionId}`);
}

export async function undoLastThrow(sessionId: string) {
  const userId = await getUser();
  const last = await prisma.throw.findFirst({
    where: { sessionId, userId },
    orderBy: { createdAt: "desc" },
  });
  if (last) {
    await prisma.throw.delete({ where: { id: last.id } });
    revalidatePath(`/session/${sessionId}`);
  }
}

export async function deleteSession(sessionId: string) {
  const userId = await getUser();
  const session = await prisma.session.findUnique({ where: { id: sessionId } });
  if (session?.ownerId !== userId) throw new Error("Non autorizzato");
  await prisma.session.delete({ where: { id: sessionId } });
  revalidatePath("/");
}
