import Link from "next/link";

import { ResendVerificationEmailForm } from "./resend-verification-email-form";

export default function EmailVerificationRequiredPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center gap-5 px-6 py-12 text-foreground">
      <h1 className="text-3xl font-semibold">Confirme seu email para continuar</h1>
      <p className="text-base text-muted-foreground">Sua conta foi autenticada, mas o email ainda nao foi verificado.</p>
      <p className="text-base text-muted-foreground">
        Verifique sua caixa de entrada e, apos confirmar o email, tente entrar novamente.
      </p>
      <ResendVerificationEmailForm />
      <div className="flex items-center gap-4">
        <Link
          href="/auth/logout?returnTo=/"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover"
        >
          Encerrar sessao
        </Link>
        <Link
          href="/auth/login?returnTo=/dashboard"
          className="rounded-md border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
        >
          Tentar novamente
        </Link>
      </div>
    </main>
  );
}
