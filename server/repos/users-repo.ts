import "server-only";

import type { User } from "@prisma/client";

import type { UserStatus } from "@/lib/constants/user-status";
import { prisma } from "@/lib/prisma";
import type { AppUserDto } from "@/lib/types/user";

export interface UpsertUserFromAuthInput {
  authProvider: string;
  authSubject: string;
  email: string;
  emailVerified: boolean;
  loginAt: Date;
}

export interface UsersRepository {
  upsertFromAuthIdentity(input: UpsertUserFromAuthInput): Promise<AppUserDto>;
  deleteByAuthSubject(authSubject: string): Promise<{ deletedCount: number }>;
}

function mapUserEntity(user: User): AppUserDto {
  return {
    id: user.id,
    email: user.email,
    emailVerified: user.emailVerified,
    status: user.status as UserStatus,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
  };
}

export class PrismaUsersRepository implements UsersRepository {
  async upsertFromAuthIdentity(input: UpsertUserFromAuthInput): Promise<AppUserDto> {
    const user = await prisma.user.upsert({
      where: {
        authSubject: input.authSubject,
      },
      create: {
        authProvider: input.authProvider,
        authSubject: input.authSubject,
        email: input.email,
        emailVerified: input.emailVerified,
        lastLoginAt: input.loginAt,
      },
      update: {
        email: input.email,
        emailVerified: input.emailVerified,
        lastLoginAt: input.loginAt,
      },
    });

    return mapUserEntity(user);
  }

  async deleteByAuthSubject(authSubject: string): Promise<{ deletedCount: number }> {
    const result = await prisma.user.deleteMany({
      where: {
        authSubject,
      },
    });

    return {
      deletedCount: result.count,
    };
  }
}

export const usersRepository: UsersRepository = new PrismaUsersRepository();
