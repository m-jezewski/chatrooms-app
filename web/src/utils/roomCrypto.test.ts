import { describe, it, expect } from 'vitest';
import {
  base64ToUint8,
  decrypt,
  deriveRoomSecrets,
  encrypt,
  generateSalt,
  generateSenderId,
  IV_BYTES,
} from './roomCrypto';

const TAG_BYTES = 16;

const deriveKey = async (password: string, salt: Uint8Array<ArrayBuffer>) =>
  (await deriveRoomSecrets(password, salt)).key;

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
    const key = await deriveKey('foobar', generateSalt());
    const plaintext = JSON.stringify({ foo: 'foo', text: 'bar' });

    const blob = await encrypt(key, plaintext);
    expect(await decrypt(key, blob)).toBe(plaintext);
  });

  it('produces a fresh initialization vector each time', async () => {
    const key = await deriveKey('pw', generateSalt());
    expect(await encrypt(key, 'same')).not.toBe(await encrypt(key, 'same'));
  });

  it('blob is base64( IV[12] ‖ ciphertext ‖ tag[16] )', async () => {
    const key = await deriveKey('pw', generateSalt());
    const text = 'hi'; // 2 ASCII bytes

    const bytes = base64ToUint8(await encrypt(key, text));
    expect(bytes).toHaveLength(IV_BYTES + text.length + TAG_BYTES);
  });

  it('rejects a tampered blob', async () => {
    const key = await deriveKey('pw', generateSalt());
    const bytes = base64ToUint8(await encrypt(key, 'secret'));
    bytes[bytes.length - 1] ^= 0xff; // flip a tag byte

    await expect(decrypt(key, btoa(String.fromCharCode(...bytes)))).rejects.toThrow();
  });
});

describe('deriveRoomSecrets', () => {
  it('is deterministic for the same password + salt', async () => {
    const salt = generateSalt();
    const a = await deriveRoomSecrets('shared-password', salt);
    const b = await deriveRoomSecrets('shared-password', salt);

    expect(a.authKey).toBe(b.authKey);
    // non-extractable keys can't be compared directly — prove equality by cross-decrypting
    expect(await decrypt(b.key, await encrypt(a.key, 'cross'))).toBe('cross');
  });

  it('a different password yields a different authKey and an incompatible key', async () => {
    const salt = generateSalt();
    const a = await deriveRoomSecrets('correct', salt);
    const b = await deriveRoomSecrets('wrong', salt);

    expect(a.authKey).not.toBe(b.authKey);
    await expect(decrypt(b.key, await encrypt(a.key, 'nope'))).rejects.toThrow();
  });

  it('a different salt yields a different authKey and an incompatible key', async () => {
    const a = await deriveRoomSecrets('pw', generateSalt());
    const b = await deriveRoomSecrets('pw', generateSalt());

    expect(a.authKey).not.toBe(b.authKey);
    await expect(decrypt(b.key, await encrypt(a.key, 'nope'))).rejects.toThrow();
  });

  it('authKey is base64 of 32 bytes', async () => {
    const { authKey } = await deriveRoomSecrets('pw', generateSalt());
    expect(base64ToUint8(authKey)).toHaveLength(32);
  });

  // Pins the whole derivation (PBKDF2 params, HKDF labels). If this test breaks, the change
  // locks every existing room out of its history — bump the info labels to /v2 instead.
  it('matches the pinned vector', async () => {
    const salt = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
    const { key, authKey } = await deriveRoomSecrets('fixed-vector-password', salt);

    expect(authKey).toBe('sHPM7Gh/gDVn/vIYZjtyDytYKh+lFb188nUDw0Eg/so=');
    expect(await decrypt(key, 'ZGVmZ2hpamtsbW5vxCw7r9V4JRWSBxxnMHuR+HtCu5jmi5b66U0nXw==')).toBe('fixed-vector');
  });
});
