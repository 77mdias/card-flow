"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

interface SignInFormProps {
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

export function SignInForm({ returnTo }: SignInFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const password = String(formData.get("password") ?? "");

    startTransition(async () => {
      try {
        const response = await fetch("/api/auth/sign-in/email", {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
            callbackURL: returnTo,
          }),
        });

        const payload = (await response.json().catch(() => null)) as unknown;

        if (!response.ok) {
          setErrorMessage(
            extractErrorMessage(payload) ??
              "Nao foi possivel entrar. Revise os dados e tente novamente.",
          );
          return;
        }

        if (
          payload &&
          typeof payload === "object" &&
          "url" in payload &&
          typeof payload.url === "string" &&
          payload.url.length > 0
        ) {
          window.location.href = payload.url;
          return;
        }

        router.push(returnTo);
        router.refresh();
      } catch {
        setErrorMessage("Falha de rede ao tentar autenticar. Tente novamente.");
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-sm flex-col gap-3">
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
          autoComplete="current-password"
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
        {isPending ? "Entrando..." : "Entrar"}
      </button>

      <p className="text-sm text-zinc-600">
        Ainda nao tem conta?{" "}
        <Link href={`/auth/register?returnTo=${encodeURIComponent(returnTo)}`} className="underline">
          Criar conta
        </Link>
      </p>
    </form>
  );
}
