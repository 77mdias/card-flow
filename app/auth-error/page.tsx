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
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center gap-5 px-6 py-12 text-zinc-900">
      <h1 className="text-3xl font-semibold">Nao foi possivel concluir o login</h1>
      <p className="text-base text-zinc-700">
        Tivemos uma falha temporaria durante o retorno da autenticacao.
      </p>
      <p className="text-base text-zinc-700">
        Tente novamente. Se o problema persistir, aguarde alguns instantes e repita o
        processo.
      </p>
      <div className="flex items-center gap-4">
        <Link
          href={retryHref}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
        >
          Tentar novamente
        </Link>
        <Link
          href="/"
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Ir para inicio
        </Link>
      </div>
    </main>
  );
}
