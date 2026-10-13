import { createContext, useCallback, useContext, useMemo, useState, ReactNode } from 'react';
import { RoomSecrets } from '../../utils/roomCrypto.ts';

interface RoomKeyCtx {
  keys: Map<string, RoomSecrets>;
  setKey: (roomId: string, secrets: RoomSecrets) => void;
  clear: () => void;
}

const RoomKeyContext = createContext<RoomKeyCtx | null>(null);

export const RoomKeyContextProvider = ({ children }: { children: ReactNode }) => {
  const [keys, setKeys] = useState(new Map<string, RoomSecrets>());

  const setKey = useCallback((roomId: string, secrets: RoomSecrets) => {
    setKeys((prev) => new Map(prev).set(roomId, secrets));
  }, []);

  const clear = useCallback(() => setKeys(new Map()), []);

  const value = useMemo<RoomKeyCtx>(() => ({ keys, setKey, clear }), [keys, setKey, clear]);

  return <RoomKeyContext.Provider value={value}>{children}</RoomKeyContext.Provider>;
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
