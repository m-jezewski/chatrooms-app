import { useEffect, useState } from 'react';
import { decrypt } from '../../utils/roomCrypto.ts';

export interface DecryptedMessage {
  nickname: string;
  text: string;
}

const readMessage = async (roomKey: CryptoKey, payload: string): Promise<DecryptedMessage> => {
  try {
    const { nickname, text } = JSON.parse(await decrypt(roomKey, payload));
    return { nickname, text };
  } catch {
    return { nickname: 'Unknown', text: '[unable to decrypt]' };
  }
};

export const useDecryptedMessage = (roomKey: CryptoKey | undefined, payload: string) => {
  const [decrypted, setDecrypted] = useState<DecryptedMessage>();

  useEffect(() => {
    if (!roomKey) {
      return;
    }

    let wanted = true;

    void readMessage(roomKey, payload).then((message) => {
      if (wanted) {
        setDecrypted(message);
      }
    });

    return () => {
      wanted = false;
    };
  }, [roomKey, payload]);

  return decrypted;
};
