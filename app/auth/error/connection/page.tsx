import Link from "next/link";

type AuthFlow = "login" | "register" | "unknown";

interface ConnectionErrorPageProps {
  searchParams: Promise<{
    flow?: string;
    returnTo?: string;
  }>;
}

function resolveReturnTo(returnTo: string | undefined): string {
  if (!returnTo || !returnTo.startsWith("/")) {
    return "/dashboard";
  }

  return returnTo;
}

function resolveFlow(flow: string | undefined): AuthFlow {
  if (flow === "login") {
    return "login";
  }

  if (flow === "register") {
    return "register";
  }

  return "unknown";
}

function getRetryAction(flow: AuthFlow, returnTo: string): {
  href: string;
  label: string;
} {
  if (flow === "register") {
    return {
      href: `/auth/register?returnTo=${encodeURIComponent(returnTo)}`,
      label: "Tentar cadastro novamente",
    };
  }

  return {
    href: `/auth/login?returnTo=${encodeURIComponent(returnTo)}`,
    label: "Tentar login novamente",
  };
}

export default async function ConnectionErrorPage({
  searchParams,
}: ConnectionErrorPageProps) {
  const params = await searchParams;
  const returnTo = resolveReturnTo(params.returnTo);
  const flow = resolveFlow(params.flow);
  const retryAction = getRetryAction(flow, returnTo);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center gap-5 px-6 py-12 text-zinc-900">
      <h1 className="text-3xl font-semibold">Erro de conexao</h1>
      <p className="text-base text-zinc-700">
        Nao foi possivel completar a autenticacao por falha de rede ou indisponibilidade temporaria.
      </p>
      <p className="text-base text-zinc-700">
        Verifique sua conexao e tente novamente. Se o problema persistir, aguarde alguns instantes.
      </p>
      <div className="flex flex-wrap items-center gap-4">
        <Link
          href={retryAction.href}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
        >
          {retryAction.label}
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
