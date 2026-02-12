"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

interface SignUpFormProps {
  returnTo: string;
}

function extractErrorMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  if ("message" in payload && typeof payload.message === "string") {
    return payload.message;
  }

  if (
    "error" in payload &&
    payload.error &&
    typeof payload.error === "object" &&
    "message" in payload.error &&
    typeof payload.error.message === "string"
  ) {
    return payload.error.message;
  }

  return null;
}

export function SignUpForm({ returnTo }: SignUpFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const password = String(formData.get("password") ?? "");

    startTransition(async () => {
      try {
        const response = await fetch("/api/auth/sign-up/email", {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            password,
            callbackURL: returnTo,
          }),
        });

        const payload = (await response.json().catch(() => null)) as unknown;
        if (!response.ok) {
          setErrorMessage(
            extractErrorMessage(payload) ??
              "Nao foi possivel criar a conta. Revise os dados e tente novamente.",
          );
          return;
        }

        router.push(returnTo);
        router.refresh();
      } catch {
        setErrorMessage("Falha de rede ao criar conta. Tente novamente.");
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-sm flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm text-zinc-700">
        Nome
        <input
          type="text"
          name="name"
          required
          autoComplete="name"
          className="rounded-md border border-zinc-300 px-3 py-2 text-zinc-900"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-zinc-700">
        Email
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          className="rounded-md border border-zinc-300 px-3 py-2 text-zinc-900"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-zinc-700">
        Senha
        <input
          type="password"
          name="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="rounded-md border border-zinc-300 px-3 py-2 text-zinc-900"
        />
      </label>

      {errorMessage ? (
        <p className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMessage}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Criando conta..." : "Criar conta"}
      </button>

      <p className="text-sm text-zinc-600">
        Ja possui conta?{" "}
        <Link href={`/auth/login?returnTo=${encodeURIComponent(returnTo)}`} className="underline">
          Entrar
        </Link>
      </p>
    </form>
  );
}
