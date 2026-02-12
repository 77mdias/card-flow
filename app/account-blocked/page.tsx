import Link from "next/link";

export default function AccountBlockedPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center gap-5 px-6 py-12 text-zinc-900">
      <h1 className="text-3xl font-semibold">Conta sem acesso</h1>
      <p className="text-base text-zinc-700">
        Sua conta esta inativa ou removida. Para reativacao, entre em contato com o
        suporte.
      </p>
      <div className="flex items-center gap-4">
        <Link
          href="/auth/logout"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
        >
          Encerrar sessao
        </Link>
        <a
          href="mailto:suporte@cardflow.app"
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Falar com suporte
        </a>
      </div>
    </main>
  );
}
