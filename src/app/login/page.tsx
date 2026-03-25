"use client";

import { useActionState, useState } from "react";
import { loginAction, registerAction } from "@/lib/actions/auth";

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [loginError, loginFormAction, loginPending] = useActionState(loginAction, null);
  const [registerError, registerFormAction, registerPending] = useActionState(registerAction, null);

  const error = isRegister ? registerError : loginError;
  const pending = isRegister ? registerPending : loginPending;

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-2xl font-bold text-center">🏐 Dodgeball Tracker</h1>
        <form action={isRegister ? registerFormAction : loginFormAction} className="space-y-4">
          {isRegister && (
            <input name="name" placeholder="Nome" className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700" />
          )}
          <input name="email" type="email" placeholder="Email" required className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700" />
          <input name="password" type="password" placeholder="Password" required minLength={6} className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700" />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button disabled={pending} className="w-full p-3 rounded-lg bg-blue-600 font-semibold disabled:opacity-50">
            {pending ? "..." : isRegister ? "Registrati" : "Accedi"}
          </button>
        </form>
        <button onClick={() => setIsRegister(!isRegister)} className="w-full text-sm text-gray-400">
          {isRegister ? "Hai già un account? Accedi" : "Non hai un account? Registrati"}
        </button>
      </div>
    </div>
  );
}
