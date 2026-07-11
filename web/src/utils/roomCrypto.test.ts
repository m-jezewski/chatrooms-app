import { describe, it, expect } from 'vitest';
import {
  base64ToUint8,
  decrypt,
  deriveRoomKey,
  encrypt,
  generateSalt,
  generateSenderId, IV_BYTES,
  makeVerificationToken,
  verifyKey,
} from './roomCrypto';

const TAG_BYTES = 16;

describe('generateSalt', () => {
  it('returns 16 random bytes', () => {
    expect(generateSalt()).toHaveLength(16);
  });

  it('is not constant', () => {
    expect(Array.from(generateSalt())).not.toEqual(Array.from(generateSalt()));
  });
});

describe('generateSenderId', () => {
  it('returns a non-empty, random token', () => {
    const id = generateSenderId();
    expect(id.length).toBeGreaterThan(0);
    expect(id).not.toMatch(/[+/=]/);
  });

  it('is unique across calls', () => {
    expect(generateSenderId()).not.toEqual(generateSenderId());
  });
});

describe('encrypt / decrypt', () => {
  it('encrypting and decrypting does not change the value', async () => {
    const key = await deriveRoomKey('foobar', generateSalt());
    const plaintext = JSON.stringify({ foo: 'foo', text: 'bar' });

    const blob = await encrypt(key, plaintext);
    expect(await decrypt(key, blob)).toBe(plaintext);
  });

  it('produces a fresh initialization vector each time', async () => {
    const key = await deriveRoomKey('pw', generateSalt());
    expect(await encrypt(key, 'same')).not.toBe(await encrypt(key, 'same'));
  });

  it('blob is base64( IV[12] ‖ ciphertext ‖ tag[16] )', async () => {
    const key = await deriveRoomKey('pw', generateSalt());
    const text = 'hi'; // 2 ASCII bytes

    const bytes = base64ToUint8(await encrypt(key, text));
    expect(bytes).toHaveLength(IV_BYTES + text.length + TAG_BYTES);
  });

  it('rejects a tampered blob', async () => {
    const key = await deriveRoomKey('pw', generateSalt());
    const bytes = base64ToUint8(await encrypt(key, 'secret'));
    bytes[bytes.length - 1] ^= 0xff; // flip a tag byte

    await expect(decrypt(key, btoa(String.fromCharCode(...bytes)))).rejects.toThrow();
  });
});

describe('deriveKey', () => {
  it('is deterministic for the same password + salt', async () => {
    const salt = generateSalt();
    const a = await deriveRoomKey('shared-password', salt);
    const b = await deriveRoomKey('shared-password', salt);

    // non-extractable keys can't be compared directly — prove equality by cross-decrypting
    expect(await decrypt(b, await encrypt(a, 'cross'))).toBe('cross');
  });

  it('a different salt yields an incompatible key', async () => {
    const a = await deriveRoomKey('pw', generateSalt());
    const b = await deriveRoomKey('pw', generateSalt());

    await expect(decrypt(b, await encrypt(a, 'nope'))).rejects.toThrow();
  });
});

describe('verifyKey', () => {
  it('accepts the key that built the token', async () => {
    const salt = generateSalt();
    const token = await makeVerificationToken(await deriveRoomKey('correct', salt));

    const reDerived = await deriveRoomKey('correct', salt);
    expect(await verifyKey(reDerived, token)).toBe(true);
  });

  it('rejects a wrong password', async () => {
    const salt = generateSalt();
    const token = await makeVerificationToken(await deriveRoomKey('correct', salt));

    const wrong = await deriveRoomKey('wrong', salt);
    expect(await verifyKey(wrong, token)).toBe(false);
  });
});