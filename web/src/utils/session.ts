import { generateSenderId } from './roomCrypto.ts';

const SENDER_ID_KEY = 'senderId';
const NICKNAME_KEY = 'nickname';
const OWNER_TOKEN_PREFIX = 'ownerToken:';

export function getSenderId(): string {
  let senderId = sessionStorage.getItem(SENDER_ID_KEY);
  if (!senderId) {
    senderId = generateSenderId();
    sessionStorage.setItem(SENDER_ID_KEY, senderId);
  }
  return senderId;
}

export function getNickname(): string {
  let nickname = sessionStorage.getItem(NICKNAME_KEY);
  if (!nickname) {
    nickname = `User #${Math.floor(1000 + Math.random() * 9000)}`;
    sessionStorage.setItem(NICKNAME_KEY, nickname);
  }
  return nickname;
}

export function saveNickname(nickname: string): void {
  sessionStorage.setItem(NICKNAME_KEY, nickname);
}

export function saveOwnerToken(roomId: string, token: string): void {
  sessionStorage.setItem(OWNER_TOKEN_PREFIX + roomId, token);
}

export function getOwnerToken(roomId: string): string | null {
  return sessionStorage.getItem(OWNER_TOKEN_PREFIX + roomId);
}

export function clearRoomSession(): void {
  sessionStorage.removeItem(SENDER_ID_KEY);
  sessionStorage.removeItem(NICKNAME_KEY);
  for (const key of Object.keys(sessionStorage)) {
    if (key.startsWith(OWNER_TOKEN_PREFIX)) {
      sessionStorage.removeItem(key);
    }
  }
}
