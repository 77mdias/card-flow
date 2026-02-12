import { SignInForm } from "./sign-in-form";

interface LoginPageProps {
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

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const returnTo = resolveReturnTo(params.returnTo);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center gap-6 px-6 py-12">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-wide text-zinc-500">CardFlow</p>
        <h1 className="text-3xl font-semibold text-zinc-900">Entrar</h1>
        <p className="max-w-xl text-base text-zinc-700">
          Acesse sua conta para continuar no CardFlow.
        </p>
      </header>
      <SignInForm returnTo={returnTo} />
    </main>
  );
}
