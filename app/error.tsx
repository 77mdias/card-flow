"use client";

import { useEffect } from "react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error("Unhandled application error", { digest: error.digest });
  }, [error]);

  return (
    <html lang="pt-BR">
      <body className="mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center gap-4 px-6 py-12 text-zinc-900">
        <h1 className="text-3xl font-semibold">Algo deu errado</h1>
        <p className="text-zinc-700">
          Ocorreu uma falha inesperada. Tente novamente em instantes.
        </p>
        <button
          type="button"
          onClick={reset}
          className="w-fit rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
        >
          Tentar novamente
        </button>
      </body>
    </html>
  );
}
