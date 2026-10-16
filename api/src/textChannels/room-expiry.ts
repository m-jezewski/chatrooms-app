import { Prisma } from '@prisma/client';

export const TTL_MIN_MS = 60 * 1000;
export const TTL_MAX_MS = 365 * 24 * 60 * 60 * 1000;
export const ANONYMOUS_TTL_MAX_MS = 30 * 24 * 60 * 60 * 1000;

export function activeRoomWhere(where: Prisma.TextChannelWhereUniqueInput): Prisma.TextChannelWhereUniqueInput {
  return { ...where, OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] };
}
