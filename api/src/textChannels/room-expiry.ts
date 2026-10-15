import { Prisma } from '@prisma/client';

export function activeRoomWhere(where: Prisma.TextChannelWhereUniqueInput): Prisma.TextChannelWhereUniqueInput {
  return { ...where, OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] };
}
