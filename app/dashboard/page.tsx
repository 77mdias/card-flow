import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { redirect } from "next/navigation";

import { getServerAuthSession } from "@/lib/auth-session";
import { authService } from "@/server/services/auth-service";

export default async function DashboardPage() {
  noStore();

  const session = await getServerAuthSession();
  const authResult = await authService.synchronizeFromSession(session);

  if (!authResult.ok) {
    if (authResult.code === "UNAUTHENTICATED" || authResult.code === "INVALID_SESSION") {
      redirect("/auth/login?returnTo=/dashboard");
    }

    if (authResult.code === "EMAIL_NOT_VERIFIED") {
      redirect("/email-verification-required");
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
        <p className="text-sm uppercase tracking-wide text-muted-foreground/80">Area privada</p>
        <h1 className="text-3xl font-semibold text-foreground">Dashboard inicial</h1>
      </header>

      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <dl className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-center justify-between gap-4">
            <dt className="font-medium text-muted-foreground/80">Email</dt>
            <dd>{authResult.data.email}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="font-medium text-muted-foreground/80">Status</dt>
            <dd>{authResult.data.status}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="font-medium text-muted-foreground/80">Ultimo login</dt>
            <dd>{formattedLastLogin}</dd>
          </div>
        </dl>
      </section>

      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="rounded-md border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
        >
          Pagina inicial
        </Link>
        <Link
          href="/auth/logout?returnTo=/"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover"
        >
          Sair
        </Link>
      </div>
    </main>
  );
}
