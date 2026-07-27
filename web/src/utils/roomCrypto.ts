// Pipeline: password + per-room salt --PBKDF2-SHA256(310k)--> 256 base bits --HKDF-SHA256-->
//   K_enc  ("chatrooms/enc/v1")  — non-extractable AES-256-GCM key, never leaves the browser
//   K_auth ("chatrooms/auth/v1") — 32B base64 proof of the password, sent to the server
// The branches are one-way: the server can't reach K_enc from K_auth.
// Message blob format: base64( IV[12B] ‖ ciphertext ‖ authTag[16B] ).
// WebCrypto appends the GCM auth tag to the ciphertext automatically.

const PBKDF2_ITERATIONS = 310_000;
const HKDF_ENC_INFO = 'chatrooms/enc/v1';
const HKDF_AUTH_INFO = 'chatrooms/auth/v1';
export const SALT_BYTES = 16;
export const IV_BYTES = 12;
const SENDER_ID_BYTES = 16;

const encoder = new TextEncoder();
const decoder = new TextDecoder();

// CREATING ROOM / ROOM ACCESS

// Random 16-byte salt, generated once per room at creation.
export function generateSalt(): Uint8Array<ArrayBuffer> {
  const salt = new Uint8Array(SALT_BYTES);
  crypto.getRandomValues(salt);
  return salt;
}

export interface RoomSecrets {
  key: CryptoKey;
  authKey: string;
}

// Derive both room secrets from the password and per-room salt.
export async function deriveRoomSecrets(password: string, salt: Uint8Array<ArrayBuffer>): Promise<RoomSecrets> {
  const baseKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const baseBits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    baseKey,
    256,
  );
  const hkdfKey = await crypto.subtle.importKey('raw', baseBits, 'HKDF', false, ['deriveKey', 'deriveBits']);

  const key = await crypto.subtle.deriveKey(
    hkdfParams(HKDF_ENC_INFO),
    hkdfKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
  const authBits = await crypto.subtle.deriveBits(hkdfParams(HKDF_AUTH_INFO), hkdfKey, 256);

  return { key, authKey: uint8ToBase64(new Uint8Array(authBits)) };
}

function hkdfParams(info: string): HkdfParams {
  // PBKDF2 already consumed the per-room salt; the distinct labels are what separates the branches.
  return { name: 'HKDF', hash: 'SHA-256', salt: new Uint8Array(0), info: encoder.encode(info) };
}


// MESSAGES

// Random opaque per-session token (not an identity, just a temp ownership handle).
export function generateSenderId(): string {
  const bytes = new Uint8Array(SENDER_ID_BYTES);
  crypto.getRandomValues(bytes);
  return uint8ToBase64Url(bytes);
}

// Encrypt a string, returning base64(IV ‖ ciphertext ‖ authTag).
export async function encrypt(key: CryptoKey, plaintext: string): Promise<string> {
  const initializationVector = new Uint8Array(IV_BYTES);
  crypto.getRandomValues(initializationVector);
  const utf8Plaintext = encoder.encode(plaintext);

  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: initializationVector },
    key,
    utf8Plaintext,
  );
  const ctBytes = new Uint8Array(ciphertext);

  const blob = new Uint8Array(initializationVector.length + ctBytes.length);
  blob.set(initializationVector, 0);
  blob.set(ctBytes, initializationVector.length);

  return uint8ToBase64(blob);
}

// Decrypt a base64(IV ‖ ciphertext ‖ authTag) blob. Throws if the key is wrong or data is tampered.
export async function decrypt(key: CryptoKey, blob: string): Promise<string> {
  const bytes = base64ToUint8(blob);
  const iv = bytes.slice(0, IV_BYTES);
  const ciphertext = bytes.slice(IV_BYTES);

  const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);

  return decoder.decode(plaintext);
}

export function uint8ToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function base64ToUint8(base64: string): Uint8Array<ArrayBuffer> {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function uint8ToBase64Url(bytes: Uint8Array): string {
  return uint8ToBase64(bytes)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}