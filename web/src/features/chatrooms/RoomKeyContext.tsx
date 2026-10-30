import { createContext, useContext, useState, ReactNode } from 'react';
import { RoomSecrets } from '../../utils/roomCrypto.ts';

interface RoomKeyContextValue {
  keys: Map<string, RoomSecrets>;
  setKey: (roomId: string, secrets: RoomSecrets) => void;
  clearKey: (roomId: string) => void;
  clear: () => void;
}

const RoomKeyContext = createContext<RoomKeyContextValue | null>(null);

export const RoomKeyContextProvider = ({ children }: { children: ReactNode }) => {
  const [keys, setKeys] = useState(new Map<string, RoomSecrets>());

  const setKey = (roomId: string, secrets: RoomSecrets) => {
    setKeys((prev) => new Map(prev).set(roomId, secrets));
  };

  const clearKey = (roomId: string) => {
    setKeys((prev) => {
      const next = new Map(prev);
      next.delete(roomId);
      return next;
    });
  };

  const clear = () => setKeys(new Map());

  return <RoomKeyContext.Provider value={{ keys, setKey, clearKey, clear }}>{children}</RoomKeyContext.Provider>;
};

export const useRoomKeyContext = () => {
  const context = useContext(RoomKeyContext);
  if (!context) {
    throw new Error('RoomKey hooks must be used within a RoomKeyProvider');
  }
  return context;
};

export const useRoomKey = (roomId: string | undefined) => {
  const context = useRoomKeyContext();
  const secrets = roomId ? context.keys.get(roomId) : undefined;

  const setSecrets = (roomSecrets: RoomSecrets) => {
    if (roomId) {
      context.setKey(roomId, roomSecrets);
    }
  };

  return { secrets, setSecrets };
};
