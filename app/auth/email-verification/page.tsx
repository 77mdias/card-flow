import Link from "next/link";

import { PublicResendVerificationEmailForm } from "./public-resend-verification-email-form";

type AuthFlowSource = "login" | "register" | "unknown";

interface EmailVerificationPageProps {
  searchParams: Promise<{
    email?: string;
    returnTo?: string;
    source?: string;
  }>;
}

function resolveReturnTo(returnTo: string | undefined): string {
  if (!returnTo || !returnTo.startsWith("/")) {
    return "/dashboard";
  }

  return returnTo;
}

function resolveSource(source: string | undefined): AuthFlowSource {
  if (source === "login") {
    return "login";
  }

  if (source === "register") {
    return "register";
  }

  return "unknown";
}

function resolveInitialEmail(email: string | undefined): string {
  const normalizedEmail = String(email ?? "").trim().toLowerCase();
  if (!normalizedEmail.includes("@")) {
    return "";
  }

  return normalizedEmail;
}

function buildIntroMessage(source: AuthFlowSource): string {
  if (source === "register") {
    return "Conta criada com sucesso. Antes de acessar o CardFlow, voce precisa confirmar seu email.";
  }

  if (source === "login") {
    return "Sua conta existe, mas ainda esta pendente de verificacao de email.";
  }

  return "Para continuar, confirme o email da sua conta usando o link enviado para sua caixa de entrada.";
}

export default async function EmailVerificationPage({
  searchParams,
}: EmailVerificationPageProps) {
  const params = await searchParams;
  const returnTo = resolveReturnTo(params.returnTo);
  const source = resolveSource(params.source);
  const initialEmail = resolveInitialEmail(params.email);
  const loginHref = `/auth/login?returnTo=${encodeURIComponent(returnTo)}`;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center gap-6 px-6 py-12">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-wide text-muted-foreground/80">CardFlow</p>
        <h1 className="text-3xl font-semibold text-foreground">Verifique seu email</h1>
        <p className="max-w-2xl text-base text-muted-foreground">{buildIntroMessage(source)}</p>
      </header>

      <section className="space-y-3 rounded-xl border border-border bg-card p-6 shadow-sm">
        <p className="text-sm text-muted-foreground">
          1. Abra o email enviado para sua conta.
        </p>
        <p className="text-sm text-muted-foreground">
          2. Clique no link de verificacao para concluir o acesso.
        </p>
        <p className="text-sm text-muted-foreground">
          3. Se o link expirar, reenvie um novo email abaixo.
        </p>
      </section>

      <PublicResendVerificationEmailForm
        initialEmail={initialEmail}
        returnTo={returnTo}
      />

      <div className="flex flex-wrap items-center gap-4">
        <Link
          href={loginHref}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover"
        >
          Ir para login
        </Link>
        <Link
          href="/"
          className="rounded-md border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
        >
          Voltar ao inicio
        </Link>
      </div>
    </main>
  );
}
