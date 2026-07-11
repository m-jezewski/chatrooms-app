import { generateSenderId } from './roomCrypto.ts';

const SENDER_ID_KEY = 'senderId';
const NICKNAME_KEY = 'nickname';

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