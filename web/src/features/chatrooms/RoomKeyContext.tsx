import { createContext, useCallback, useContext, useMemo, useState, ReactNode } from 'react';

interface RoomKeyCtx {
  keys: Map<string, CryptoKey>;
  setKey: (roomId: string, key: CryptoKey) => void;
}

const RoomKeyContext = createContext<RoomKeyCtx | null>(null);

export const RoomKeyContextProvider = ({ children }: { children: ReactNode }) => {
  const [keys, setKeys] = useState(new Map());

  const setKey = useCallback((roomId: string, key: CryptoKey) => {
    setKeys((prev) => new Map(prev).set(roomId, key));
  }, []);

  const value = useMemo<RoomKeyCtx>(() => ({ keys, setKey }), [keys, setKey]);

  return <RoomKeyContext.Provider value={value}>{children}</RoomKeyContext.Provider>;
};

export const useRoomKeyContext = () => {
  const context = useContext(RoomKeyContext);
  if (!context) {
    throw new Error('RoomKey hooks must be used within a RoomKeyProvider');
  }
  return context;
}

export const useRoomKey = (roomId: string | undefined) => {
  const context = useRoomKeyContext();
  const key = roomId ? context.keys.get(roomId) : undefined;

  const setKey = (roomKey: CryptoKey) => {
    if (roomId) {
      context.setKey(roomId, roomKey);
    }
  };

  return { key, setKey };
};