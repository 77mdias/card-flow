export type AccountDeletionFailureCode =
  | "UNAUTHENTICATED"
  | "INVALID_SESSION"
  | "NOT_CONFIGURED"
  | "AUTH_PROVIDER_DELETE_FAILED"
  | "LOCAL_DELETE_FAILED";

export type DeleteAuthenticatedAccountResult =
  | {
      ok: true;
      data: {
        logoutUrl: string;
      };
    }
  | {
      ok: false;
      code: AccountDeletionFailureCode;
      status: 401 | 502 | 503;
      message: string;
    };
