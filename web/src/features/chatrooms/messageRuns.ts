import { Message } from '../../interfaces.ts';

export const RUN_GAP_MS = 10 * 60 * 1000;

export const startsRun = (message: Message, previous?: Message) =>
  !previous ||
  previous.senderId !== message.senderId ||
  new Date(message.createdAt).getTime() - new Date(previous.createdAt).getTime() >= RUN_GAP_MS;
