"use client";

import { type ReactNode, useActionState } from "react";

import {
  initialResendVerificationEmailActionState,
  type ResendVerificationEmailActionState,
} from "@/lib/types/email-verification";

import { publicResendVerificationEmailAction } from "./actions";

interface PublicResendVerificationEmailFormProps {
  initialEmail: string;
  returnTo: string;
}

function renderFeedback(state: ResendVerificationEmailActionState): ReactNode {
  if (state.status === "idle") {
    return null;
  }

  if (state.status === "success") {
    return (
      <p className="rounded-md border border-success-border bg-success-bg px-3 py-2 text-sm text-success-foreground">
        {state.message}
      </p>
    );
  }

  return <p className="rounded-md border border-danger-border bg-danger-bg px-3 py-2 text-sm text-danger-foreground">{state.message}</p>;
}

export function PublicResendVerificationEmailForm({
  initialEmail,
  returnTo,
}: PublicResendVerificationEmailFormProps) {
  const [state, formAction, isPending] = useActionState(
    publicResendVerificationEmailAction,
    initialResendVerificationEmailActionState,
  );

  return (
    <form action={formAction} className="flex max-w-md flex-col gap-3" aria-live="polite">
      <input type="hidden" name="intent" value="public_resend_verification_email" />
      <input type="hidden" name="returnTo" value={returnTo} />
      <label className="flex flex-col gap-1 text-sm text-muted-foreground">
        Email da conta
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          defaultValue={initialEmail}
          className="rounded-md border border-border bg-input px-3 py-2 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </label>
      <button
        type="submit"
        disabled={isPending}
        className="w-fit rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Enviando..." : "Reenviar email de verificacao"}
      </button>
      {renderFeedback(state)}
    </form>
  );
}
