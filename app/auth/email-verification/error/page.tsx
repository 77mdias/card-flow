import Link from "next/link";

interface EmailVerificationErrorPageProps {
  searchParams: Promise<{
    code?: string;
    returnTo?: string;
  }>;
}

interface VerificationErrorCopy {
  title: string;
  description: string;
}

function resolveReturnTo(returnTo: string | undefined): string {
  if (!returnTo || !returnTo.startsWith("/")) {
    return "/dashboard";
  }

  return returnTo;
}

function resolveErrorCopy(code: string | undefined): VerificationErrorCopy {
  const normalizedCode = String(code ?? "").trim().toLowerCase();

  if (normalizedCode === "token_expired") {
    return {
      title: "Link de verificacao expirado",
      description:
        "O link usado para verificar seu email expirou. Solicite um novo link e tente novamente.",
    };
  }

  if (normalizedCode === "invalid_token") {
    return {
      title: "Link de verificacao invalido",
      description:
        "Nao foi possivel validar este link. Use o email mais recente enviado pelo CardFlow.",
    };
  }

  if (normalizedCode === "user_not_found") {
    return {
      title: "Conta nao encontrada",
      description:
        "Nao localizamos uma conta valida para este link de verificacao.",
    };
  }

  if (normalizedCode === "unauthorized") {
    return {
      title: "Falha de autorizacao",
      description:
        "A verificacao nao foi autorizada para esta conta. Solicite um novo link e tente novamente.",
    };
  }

  return {
    title: "Falha ao verificar email",
    description:
      "Nao foi possivel concluir a verificacao de email. Solicite um novo link e tente novamente.",
  };
}

export default async function EmailVerificationErrorPage({
  searchParams,
}: EmailVerificationErrorPageProps) {
  const params = await searchParams;
  const returnTo = resolveReturnTo(params.returnTo);
  const errorCopy = resolveErrorCopy(params.code);
  const verificationHref = `/auth/email-verification?returnTo=${encodeURIComponent(returnTo)}&source=login`;
  const loginHref = `/auth/login?returnTo=${encodeURIComponent(returnTo)}`;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center gap-5 px-6 py-12 text-foreground">
      <h1 className="text-3xl font-semibold">{errorCopy.title}</h1>
      <p className="text-base text-muted-foreground">{errorCopy.description}</p>
      <div className="flex flex-wrap items-center gap-4">
        <Link
          href={verificationHref}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover"
        >
          Solicitar novo link
        </Link>
        <Link
          href={loginHref}
          className="rounded-md border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
        >
          Voltar para login
        </Link>
      </div>
    </main>
  );
}
