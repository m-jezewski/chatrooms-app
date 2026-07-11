// Pipeline: password + per-room salt --PBKDF2-SHA256(310k)--> AES-256-GCM key.
// Message blob format: base64( IV[12B] ‖ ciphertext ‖ authTag[16B] ).
// WebCrypto appends the GCM auth tag to the ciphertext automatically.

const PBKDF2_ITERATIONS = 310_000;
export const SALT_BYTES = 16;
export const IV_BYTES = 12;
const SENDER_ID_BYTES = 16;
const VERIFICATION_PLAINTEXT = 'room-key-verification';

const encoder = new TextEncoder();
const decoder = new TextDecoder();

// CREATING ROOM / ROOM ACCESS

// Random 16-byte salt, generated once per room at creation.
export function generateSalt(): Uint8Array<ArrayBuffer> {
  const salt = new Uint8Array(SALT_BYTES);
  crypto.getRandomValues(salt);
  return salt;
}

// Derive a non-extractable AES-256-GCM key from the room password and salt.
export async function deriveRoomKey(password: string, salt: Uint8Array<ArrayBuffer>): Promise<CryptoKey> {
  const utf8Password = encoder.encode(password);

  const baseKey = await crypto.subtle.importKey(
    'raw',
    utf8Password,
    'PBKDF2',
    false,
    ['deriveKey'],
  );

  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
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

// Encrypt a known plaintext so others can later prove they derived the same key. Stored on the room (public).
export async function makeVerificationToken(key: CryptoKey): Promise<string> {
  return encrypt(key, VERIFICATION_PLAINTEXT);
}

// True if the key correctly decrypts the room's verification token (i.e. the password was right).
export async function verifyKey(key: CryptoKey, token: string): Promise<boolean> {
  try {
    return (await decrypt(key, token)) === VERIFICATION_PLAINTEXT;
  } catch {
    return false;
  }
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