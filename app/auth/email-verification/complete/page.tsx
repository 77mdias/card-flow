import Link from "next/link";
import { redirect } from "next/navigation";

interface EmailVerificationCompletePageProps {
  searchParams: Promise<{
    error?: string;
    returnTo?: string;
  }>;
}

function resolveReturnTo(returnTo: string | undefined): string {
  if (!returnTo || !returnTo.startsWith("/")) {
    return "/dashboard";
  }

  return returnTo;
}

function resolveError(error: string | undefined): string | null {
  if (!error) {
    return null;
  }

  const normalizedError = error.trim().toLowerCase();
  if (!normalizedError) {
    return null;
  }

  return normalizedError;
}

export default async function EmailVerificationCompletePage({
  searchParams,
}: EmailVerificationCompletePageProps) {
  const params = await searchParams;
  const returnTo = resolveReturnTo(params.returnTo);
  const error = resolveError(params.error);

  if (error) {
    redirect(
      `/auth/email-verification/error?code=${encodeURIComponent(error)}&returnTo=${encodeURIComponent(returnTo)}`,
    );
  }

  const loginHref = `/auth/login?returnTo=${encodeURIComponent(returnTo)}`;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center gap-5 px-6 py-12 text-foreground">
      <h1 className="text-3xl font-semibold">Email verificado com sucesso</h1>
      <p className="text-base text-muted-foreground">
        Sua conta foi confirmada. Agora voce ja pode entrar e continuar no CardFlow.
      </p>
      <div className="flex items-center gap-4">
        <Link
          href={loginHref}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover"
        >
          Entrar agora
        </Link>
        <Link
          href="/"
          className="rounded-md border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
        >
          Ir para inicio
        </Link>
      </div>
    </main>
  );
}
