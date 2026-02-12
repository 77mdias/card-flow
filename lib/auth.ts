import "server-only";

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";

import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { EmailDeliveryRepositoryError, emailDeliveryRepository, type SmtpConfig } from "@/server/repos/smtp-email-repo";

function resolveSmtpConfig(): SmtpConfig | null {
  if (!env.SMTP_HOST || !env.SMTP_PORT || !env.SMTP_USER || !env.SMTP_PASS || !env.SMTP_FROM) {
    return null;
  }

  return {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE ?? env.SMTP_PORT === 465,
    username: env.SMTP_USER,
    password: env.SMTP_PASS,
    from: env.SMTP_FROM,
    replyTo: env.SMTP_REPLY_TO,
  };
}

const smtpConfig = resolveSmtpConfig();

export const auth = betterAuth({
  appName: "CardFlow",
  baseURL: env.APP_BASE_URL,
  secret: env.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      if (!smtpConfig) {
        console.warn("[auth] verification-email-skipped", {
          reason: "SMTP_NOT_CONFIGURED",
          userId: user.id,
        });
        return;
      }

      try {
        await emailDeliveryRepository.sendVerificationEmail({
          smtp: smtpConfig,
          recipient: user.email.toLowerCase(),
          verificationUrl: url,
        });
      } catch (error) {
        if (error instanceof EmailDeliveryRepositoryError) {
          throw new Error("EMAIL_DELIVERY_FAILED");
        }

        throw error;
      }
    },
  },
  user: {
    modelName: "auth_users",
    deleteUser: {
      enabled: true,
    },
  },
  session: {
    modelName: "auth_sessions",
  },
  account: {
    modelName: "auth_accounts",
  },
  verification: {
    modelName: "auth_verifications",
  },
  plugins: [nextCookies()],
});
