// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useDecryptedMessage } from './useDecryptedMessage.ts';

const { decrypt } = vi.hoisted(() => ({ decrypt: vi.fn() }));

vi.mock('../../utils/roomCrypto.ts', () => ({ decrypt }));

const roomKey = {} as unknown as CryptoKey;

const plaintext = (text: string) => JSON.stringify({ nickname: 'Ada', text });

const deferred = () => {
  let settle: (value: string) => void = () => {};
  const promise = new Promise<string>((resolve) => {
    settle = resolve;
  });

  return { promise, settle };
};

const read = (props: { roomKey?: CryptoKey; payload: string }) =>
  renderHook(({ roomKey, payload }) => useDecryptedMessage(roomKey, payload), { initialProps: props });

describe('useDecryptedMessage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    decrypt.mockImplementation(async () => plaintext('hello there'));
  });

  it('reports the nickname and the text carried inside the payload', async () => {
    const { result } = read({ roomKey, payload: 'cipher-1' });

    await act(async () => {});

    expect(decrypt).toHaveBeenCalledWith(roomKey, 'cipher-1');
    expect(result.current).toEqual({ nickname: 'Ada', text: 'hello there' });
  });

  it('reports nothing, and decrypts nothing, until the room key is there', async () => {
    const { result, rerender } = read({ payload: 'cipher-1' });

    await act(async () => {});

    expect(decrypt).not.toHaveBeenCalled();
    expect(result.current).toBeUndefined();

    rerender({ roomKey, payload: 'cipher-1' });
    await act(async () => {});

    expect(result.current).toEqual({ nickname: 'Ada', text: 'hello there' });
  });

  it('calls the message unreadable when it cannot be decrypted', async () => {
    decrypt.mockRejectedValue(new Error('wrong key'));
    const { result } = read({ roomKey, payload: 'cipher-1' });

    await act(async () => {});

    expect(result.current).toEqual({ nickname: 'Unknown', text: '[unable to decrypt]' });
  });

  it('calls the message unreadable when what came out is not a message', async () => {
    decrypt.mockResolvedValue('not json at all');
    const { result } = read({ roomKey, payload: 'cipher-1' });

    await act(async () => {});

    expect(result.current).toEqual({ nickname: 'Unknown', text: '[unable to decrypt]' });
  });

  it('keeps the text of the payload it was last asked about, however late the earlier one lands', async () => {
    const first = deferred();
    const second = deferred();
    decrypt.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);

    const { result, rerender } = read({ roomKey, payload: 'cipher-1' });
    rerender({ roomKey, payload: 'cipher-2' });

    await act(async () => {
      second.settle(plaintext('the second one'));
    });

    expect(result.current?.text).toBe('the second one');

    await act(async () => {
      first.settle(plaintext('the first one'));
    });

    expect(result.current?.text).toBe('the second one');
  });
});
