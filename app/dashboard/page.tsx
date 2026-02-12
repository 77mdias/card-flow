import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { redirect } from "next/navigation";

import { auth0 } from "@/lib/auth0";
import { authService } from "@/server/services/auth-service";

export default async function DashboardPage() {
  noStore();

  const session = await auth0.getSession();
  const authResult = await authService.synchronizeFromSession(session);

  if (!authResult.ok) {
    if (
      authResult.code === "UNAUTHENTICATED" ||
      authResult.code === "INVALID_SESSION"
    ) {
      redirect("/auth/login?returnTo=/dashboard");
    }

    redirect("/account-blocked");
  }

  const formattedLastLogin = new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(authResult.data.lastLoginAt);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-12">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-wide text-zinc-500">Area privada</p>
        <h1 className="text-3xl font-semibold text-zinc-900">Dashboard inicial</h1>
      </header>

      <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <dl className="space-y-3 text-sm text-zinc-700">
          <div className="flex items-center justify-between gap-4">
            <dt className="font-medium text-zinc-500">Email</dt>
            <dd>{authResult.data.email}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="font-medium text-zinc-500">Status</dt>
            <dd>{authResult.data.status}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="font-medium text-zinc-500">Ultimo login</dt>
            <dd>{formattedLastLogin}</dd>
          </div>
        </dl>
      </section>

      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Pagina inicial
        </Link>
        <Link
          href="/auth/logout"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
        >
          Sair
        </Link>
      </div>
    </main>
  );
}
