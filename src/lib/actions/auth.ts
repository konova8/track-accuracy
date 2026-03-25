"use server";

import { hash } from "bcryptjs";
import { signIn } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function register(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) throw new Error("Email e password richiesti");

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) throw new Error("Email già registrata");

  const hashedPassword = await hash(password, 10);
  await prisma.user.create({ data: { name, email, hashedPassword } });

  await signIn("credentials", { email, password, redirectTo: "/" });
}

export async function login(formData: FormData) {
  await signIn("credentials", {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    redirectTo: "/",
  });
}

export async function loginAction(_prev: unknown, formData: FormData) {
  try {
    await login(formData);
    return null;
  } catch (e: unknown) {
    if (e && typeof e === "object" && "digest" in e) throw e; // NEXT_REDIRECT
    return "Credenziali non valide";
  }
}

export async function registerAction(_prev: unknown, formData: FormData) {
  try {
    await register(formData);
    return null;
  } catch (e: unknown) {
    if (e && typeof e === "object" && "digest" in e) throw e;
    return (e as Error).message || "Errore nella registrazione";
  }
}
