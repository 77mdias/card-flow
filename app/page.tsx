import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";

import { getServerAuthSession } from "@/lib/auth-session";

export default async function HomePage() {
  noStore();

  const session = await getServerAuthSession();
  const isAuthenticated = Boolean(session);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center gap-8 px-6 py-12">
      <header className="space-y-3">
        <p className="text-sm uppercase tracking-wide text-zinc-500">CardFlow</p>
        <h1 className="text-4xl font-semibold text-zinc-900">Fundacao de autenticacao e ciclo de usuario</h1>
        <p className="max-w-2xl text-base text-zinc-700">
          Base inicial do MVP com Better Auth, sessao server-side e sincronizacao de usuario interno.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        {isAuthenticated ? (
          <>
            <Link
              href="/dashboard"
              className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
            >
              Ir para dashboard
            </Link>
            <Link
              href="/auth/logout?returnTo=/"
              className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              Sair
            </Link>
          </>
        ) : (
          <Link
            href="/auth/login?returnTo=/dashboard"
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
          >
            Entrar
          </Link>
        )}
      </div>
    </main>
  );
}
