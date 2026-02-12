import "server-only";

import nodemailer, { type Transporter } from "nodemailer";

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
  from: string;
  replyTo?: string;
}

export interface SendVerificationEmailInput {
  smtp: SmtpConfig;
  recipient: string;
  verificationUrl: string;
}

export interface EmailDeliveryRepository {
  sendVerificationEmail(input: SendVerificationEmailInput): Promise<void>;
}

type EmailDeliveryRepositoryErrorCode = "SMTP_SEND_FAILED";

export class EmailDeliveryRepositoryError extends Error {
  constructor(public readonly code: EmailDeliveryRepositoryErrorCode) {
    super(code);
    this.name = "EmailDeliveryRepositoryError";
  }
}

const globalForTransporters = globalThis as unknown as {
  smtpTransporters?: Map<string, Transporter>;
};

const smtpTransporters = globalForTransporters.smtpTransporters ?? new Map<string, Transporter>();

if (process.env.NODE_ENV !== "production") {
  globalForTransporters.smtpTransporters = smtpTransporters;
}

function transporterKey(smtp: SmtpConfig): string {
  return `${smtp.host}:${smtp.port}:${smtp.secure}:${smtp.username}`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export class NodemailerEmailDeliveryRepository implements EmailDeliveryRepository {
  private getTransporter(smtp: SmtpConfig): Transporter {
    const key = transporterKey(smtp);
    const cachedTransporter = smtpTransporters.get(key);
    if (cachedTransporter) {
      return cachedTransporter;
    }

    const transporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.secure,
      auth: {
        user: smtp.username,
        pass: smtp.password,
      },
      connectionTimeout: 15_000,
      socketTimeout: 15_000,
      greetingTimeout: 15_000,
    });

    smtpTransporters.set(key, transporter);
    return transporter;
  }

  async sendVerificationEmail(input: SendVerificationEmailInput): Promise<void> {
    const escapedUrl = escapeHtml(input.verificationUrl);
    const transporter = this.getTransporter(input.smtp);

    try {
      await transporter.sendMail({
        from: input.smtp.from,
        to: input.recipient,
        replyTo: input.smtp.replyTo,
        subject: "Confirme seu email para acessar o CardFlow",
        text: [
          "Recebemos uma solicitacao para verificar seu email no CardFlow.",
          "",
          "Abra o link abaixo para concluir a verificacao:",
          input.verificationUrl,
          "",
          "Se voce nao solicitou esta acao, ignore esta mensagem.",
        ].join("\n"),
        html: [
          "<p>Recebemos uma solicitacao para verificar seu email no CardFlow.</p>",
          "<p>Abra o link abaixo para concluir a verificacao:</p>",
          `<p><a href="${escapedUrl}">Confirmar email</a></p>`,
          "<p>Se voce nao solicitou esta acao, ignore esta mensagem.</p>",
        ].join(""),
      });
    } catch {
      throw new EmailDeliveryRepositoryError("SMTP_SEND_FAILED");
    }
  }
}

export const emailDeliveryRepository: EmailDeliveryRepository =
  new NodemailerEmailDeliveryRepository();
