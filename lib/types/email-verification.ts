export type VerificationEmailFailureCode =
  | "UNAUTHENTICATED"
  | "INVALID_SESSION"
  | "ALREADY_VERIFIED"
  | "NOT_CONFIGURED"
  | "RATE_LIMITED"
  | "TICKET_CREATION_FAILED"
  | "EMAIL_DELIVERY_FAILED";

export type SendVerificationEmailResult =
  | {
      ok: true;
      data: {
        sentAt: Date;
      };
    }
  | {
      ok: false;
      code: VerificationEmailFailureCode;
      status: 401 | 403 | 409 | 429 | 502 | 503;
      message: string;
      retryAfterSeconds?: number;
    };

export type ResendVerificationEmailActionState =
  | {
      status: "idle";
      message: null;
    }
  | {
      status: "success";
      message: string;
    }
  | {
      status: "error";
      code: VerificationEmailFailureCode | "INVALID_INPUT";
      message: string;
    };

export const initialResendVerificationEmailActionState: ResendVerificationEmailActionState = {
  status: "idle",
  message: null,
};
