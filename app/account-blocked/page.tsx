import Link from "next/link";

export default function AccountBlockedPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center gap-5 px-6 py-12 text-foreground">
      <h1 className="text-3xl font-semibold">Conta sem acesso</h1>
      <p className="text-base text-muted-foreground">
        Sua conta esta inativa ou removida. Para reativacao, entre em contato com o suporte.
      </p>
      <div className="flex items-center gap-4">
        <Link
          href="/auth/logout?returnTo=/"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover"
        >
          Encerrar sessao
        </Link>
        <a
          href="mailto:suporte@cardflow.app"
          className="rounded-md border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
        >
          Falar com suporte
        </a>
      </div>
    </main>
  );
}
