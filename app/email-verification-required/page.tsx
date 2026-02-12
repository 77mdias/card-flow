import Link from "next/link";

import { ResendVerificationEmailForm } from "./resend-verification-email-form";

export default function EmailVerificationRequiredPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center gap-5 px-6 py-12 text-zinc-900">
      <h1 className="text-3xl font-semibold">Confirme seu email para continuar</h1>
      <p className="text-base text-zinc-700">Sua conta foi autenticada, mas o email ainda nao foi verificado.</p>
      <p className="text-base text-zinc-700">
        Verifique sua caixa de entrada e, apos confirmar o email, tente entrar novamente.
      </p>
      <ResendVerificationEmailForm />
      <div className="flex items-center gap-4">
        <Link
          href="/auth/logout?returnTo=/"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
        >
          Encerrar sessao
        </Link>
        <Link
          href="/auth/login?returnTo=/dashboard"
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Tentar novamente
        </Link>
      </div>
    </main>
  );
}
