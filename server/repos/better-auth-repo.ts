import "server-only";

import { auth } from "@/lib/auth";

type BetterAuthRepositoryErrorCode =
  | "DELETE_USER_FAILED"
  | "SEND_VERIFICATION_EMAIL_FAILED";

export class BetterAuthRepositoryError extends Error {
  constructor(public readonly code: BetterAuthRepositoryErrorCode) {
    super(code);
    this.name = "BetterAuthRepositoryError";
  }
}

export interface BetterAuthRepository {
  deleteCurrentUser(input: {
    headers: Headers;
  }): Promise<void>;
  sendVerificationEmail(input: {
    email: string;
    callbackURL?: string;
  }): Promise<void>;
}

export class HttpBetterAuthRepository implements BetterAuthRepository {
  async deleteCurrentUser(input: { headers: Headers }): Promise<void> {
    try {
      await auth.api.deleteUser({
        headers: input.headers,
        body: {},
      });
    } catch {
      throw new BetterAuthRepositoryError("DELETE_USER_FAILED");
    }
  }

  async sendVerificationEmail(input: {
    email: string;
    callbackURL?: string;
  }): Promise<void> {
    try {
      await auth.api.sendVerificationEmail({
        body: {
          email: input.email.toLowerCase(),
          callbackURL: input.callbackURL,
        },
      });
    } catch {
      throw new BetterAuthRepositoryError("SEND_VERIFICATION_EMAIL_FAILED");
    }
  }
}

export const betterAuthRepository: BetterAuthRepository = new HttpBetterAuthRepository();
