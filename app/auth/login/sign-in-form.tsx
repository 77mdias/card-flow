"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

interface SignInFormProps {
  returnTo: string;
}

interface AuthApiError {
  code: string | null;
  message: string | null;
}

function extractAuthError(payload: unknown): AuthApiError {
  if (!payload || typeof payload !== "object") {
    return {
      code: null,
      message: null,
    };
  }

  if ("code" in payload && typeof payload.code === "string") {
    return {
      code: payload.code,
      message: "message" in payload && typeof payload.message === "string" ? payload.message : null,
    };
  }

  if (
    "error" in payload &&
    payload.error &&
    typeof payload.error === "object" &&
    "code" in payload.error &&
    typeof payload.error.code === "string"
  ) {
    return {
      code: payload.error.code,
      message: "message" in payload.error && typeof payload.error.message === "string" ? payload.error.message : null,
    };
  }

  if ("message" in payload && typeof payload.message === "string") {
    return {
      code: null,
      message: payload.message,
    };
  }

  if (
    "error" in payload &&
    payload.error &&
    typeof payload.error === "object" &&
    "message" in payload.error &&
    typeof payload.error.message === "string"
  ) {
    return {
      code: null,
      message: payload.error.message,
    };
  }

  return {
    code: null,
    message: null,
  };
}

function isEmailNotVerifiedError(authError: AuthApiError): boolean {
  const normalizedCode = authError.code?.toLowerCase() ?? "";
  const normalizedMessage = authError.message?.toLowerCase() ?? "";

  return (
    normalizedCode.includes("email_not_verified") ||
    normalizedMessage.includes("email not verified") ||
    normalizedMessage.includes("confirme seu email")
  );
}

function buildVerificationCallbackUrl(returnTo: string): string {
  return `/auth/email-verification/complete?returnTo=${encodeURIComponent(returnTo)}`;
}

export function SignInForm({ returnTo }: SignInFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "")
      .trim()
      .toLowerCase();
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
            callbackURL: buildVerificationCallbackUrl(returnTo),
          }),
        });

        const payload = (await response.json().catch(() => null)) as unknown;

        if (!response.ok) {
          const authError = extractAuthError(payload);

          if (isEmailNotVerifiedError(authError)) {
            router.push(
              `/auth/email-verification?email=${encodeURIComponent(email)}&returnTo=${encodeURIComponent(returnTo)}&source=login`,
            );
            return;
          }

          setErrorMessage(authError.message ?? "Nao foi possivel entrar. Revise os dados e tente novamente.");
          return;
        }

        router.push(returnTo);
        router.refresh();
      } catch {
        router.push(`/auth/error/connection?flow=login&returnTo=${encodeURIComponent(returnTo)}`);
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-sm flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm text-muted-foreground">
        Email
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          className="rounded-md border border-border bg-input px-3 py-2 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-muted-foreground">
        Senha
        <input
          type="password"
          name="password"
          required
          autoComplete="current-password"
          className="rounded-md border border-border bg-input px-3 py-2 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </label>

      {errorMessage ? (
        <p className="rounded-md border border-danger-border bg-danger-bg px-3 py-2 text-sm text-danger-foreground">{errorMessage}</p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Entrando..." : "Entrar"}
      </button>

      <p className="text-sm text-muted-foreground">
        Ainda nao tem conta?{" "}
        <Link href={`/auth/register?returnTo=${encodeURIComponent(returnTo)}`} className="underline">
          Criar conta
        </Link>
      </p>
    </form>
  );
}
