import Link from "next/link";

interface AuthErrorPageProps {
  searchParams: Promise<{
    returnTo?: string;
  }>;
}

function resolveReturnTo(returnTo: string | undefined): string {
  if (!returnTo || !returnTo.startsWith("/")) {
    return "/dashboard";
  }

  return returnTo;
}

export default async function AuthErrorPage({ searchParams }: AuthErrorPageProps) {
  const params = await searchParams;
  const returnTo = resolveReturnTo(params.returnTo);
  const retryHref = `/auth/login?returnTo=${encodeURIComponent(returnTo)}`;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center gap-5 px-6 py-12 text-foreground">
      <h1 className="text-3xl font-semibold">Nao foi possivel concluir o login</h1>
      <p className="text-base text-muted-foreground">
        Tivemos uma falha temporaria durante o retorno da autenticacao.
      </p>
      <p className="text-base text-muted-foreground">
        Tente novamente. Se o problema persistir, aguarde alguns instantes e repita o
        processo.
      </p>
      <div className="flex items-center gap-4">
        <Link
          href={retryHref}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover"
        >
          Tentar novamente
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
