import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center gap-4 px-6 py-12 text-zinc-900">
      <h1 className="text-3xl font-semibold">Pagina nao encontrada</h1>
      <p className="text-zinc-700">O recurso solicitado nao existe ou foi movido.</p>
      <Link
        href="/"
        className="w-fit rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
      >
        Voltar para inicio
      </Link>
    </main>
  );
}
