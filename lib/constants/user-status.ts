export const USER_STATUSES = ["ACTIVE", "INACTIVE", "DELETED"] as const;

export type UserStatus = (typeof USER_STATUSES)[number];
