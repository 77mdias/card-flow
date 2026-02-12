"use client";

import { type ReactNode, useActionState } from "react";

import {
  initialResendVerificationEmailActionState,
  type ResendVerificationEmailActionState,
} from "@/lib/types/email-verification";

import { resendVerificationEmailAction } from "./actions";

function renderFeedback(state: ResendVerificationEmailActionState): ReactNode {
  if (state.status === "idle") {
    return null;
  }

  if (state.status === "success") {
    return (
      <p className="rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
        {state.message}
      </p>
    );
  }

  return <p className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">{state.message}</p>;
}

export function ResendVerificationEmailForm() {
  const [state, formAction, isPending] = useActionState(
    resendVerificationEmailAction,
    initialResendVerificationEmailActionState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-3" aria-live="polite">
      <input type="hidden" name="intent" value="resend_verification_email" />
      <button
        type="submit"
        disabled={isPending}
        className="w-fit rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Enviando..." : "Reenviar email de verificacao"}
      </button>
      {renderFeedback(state)}
    </form>
  );
}
