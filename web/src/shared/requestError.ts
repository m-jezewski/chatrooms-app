export const ERROR_MESSAGES = {
  RETRY_IN_A_MINUTE: 'Too many attempts — try again in a minute',
  RETRY_LATER: 'Too many attempts — try again later',
  ROOM_IS_GONE: 'This room no longer exists.',
  OWNER_ONLY: 'Only the room owner can do that.',
  INCORRECT_PASSWORD: 'Incorrect password',
  DAMAGED_ROOM_KEY: 'Could not unlock this room — its encryption data looks damaged',
} as const;

export const getErrorStatus = (error: unknown) => (error as { status?: number | string })?.status;

export const failureMessage = (error: unknown, fallback: string, byStatus: Record<number, string> = {}) =>
  byStatus[Number(getErrorStatus(error))] ?? fallback;
