import type { UserStatus } from "@/lib/constants/user-status";

export interface AppUserDto {
  id: string;
  email: string;
  emailVerified: boolean;
  status: UserStatus;
  lastLoginAt: Date;
  createdAt: Date;
}
