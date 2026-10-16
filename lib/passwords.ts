import { randomBytes, scrypt, scryptSync, timingSafeEqual } from 'crypto';

const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const KEY_LENGTH = 64;
const SALT_BYTES = 16;

function deriveKeyAsync(
  password: string,
  salt: Buffer,
  keylen: number,
  options: { N: number; r: number; p: number }
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, keylen, options, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(derivedKey);
    });
  });
}

/**
 * Hash a plaintext password using Node.js crypto.scrypt with a cryptographically random 16-byte salt.
 * Output format: `scrypt$<N>$<r>$<p>$<salt_hex>$<hash_hex>`
 */
export async function hashPassword(password: string): Promise<string> {
  if (typeof password !== 'string' || password.length === 0) {
    throw new Error('INVALID_PASSWORD: Password must be a non-empty string');
  }

  const salt = randomBytes(SALT_BYTES);
  const derivedKey = await deriveKeyAsync(password, salt, KEY_LENGTH, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P
  });

  return `scrypt$${SCRYPT_N}$${SCRYPT_R}$${SCRYPT_P}$${salt.toString('hex')}$${derivedKey.toString('hex')}`;
}

/**
 * Synchronous password hashing helper for deterministic test fixtures or sync contexts.
 */
export function hashPasswordSync(password: string): string {
  if (typeof password !== 'string' || password.length === 0) {
    throw new Error('INVALID_PASSWORD: Password must be a non-empty string');
  }

  const salt = randomBytes(SALT_BYTES);
  const derivedKey = scryptSync(password, salt, KEY_LENGTH, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P
  });

  return `scrypt$${SCRYPT_N}$${SCRYPT_R}$${SCRYPT_P}$${salt.toString('hex')}$${derivedKey.toString('hex')}`;
}

/**
 * Verify a candidate password against a stored scrypt hash using constant-time comparison.
 * Returns false for missing, null, empty, or malformed hashes without throwing.
 */
export async function verifyPassword(
  password: string,
  storedHash: string | null | undefined
): Promise<boolean> {
  try {
    if (
      typeof password !== 'string' ||
      password.length === 0 ||
      typeof storedHash !== 'string' ||
      storedHash.trim().length === 0
    ) {
      return false;
    }

    const parts = storedHash.trim().split('$');
    let n = SCRYPT_N;
    let r = SCRYPT_R;
    let p = SCRYPT_P;
    let saltHex: string;
    let hashHex: string;

    if (parts.length === 6 && parts[0] === 'scrypt') {
      n = parseInt(parts[1], 10);
      r = parseInt(parts[2], 10);
      p = parseInt(parts[3], 10);
      saltHex = parts[4];
      hashHex = parts[5];
    } else if (parts.length === 3 && parts[0] === 'scrypt') {
      saltHex = parts[1];
      hashHex = parts[2];
    } else {
      return false;
    }

    if (
      !Number.isFinite(n) ||
      !Number.isFinite(r) ||
      !Number.isFinite(p) ||
      n <= 1 ||
      r <= 0 ||
      p <= 0 ||
      !saltHex ||
      !hashHex ||
      saltHex.length % 2 !== 0 ||
      hashHex.length % 2 !== 0 ||
      !/^[0-9a-fA-F]+$/.test(saltHex) ||
      !/^[0-9a-fA-F]+$/.test(hashHex)
    ) {
      return false;
    }

    const salt = Buffer.from(saltHex, 'hex');
    const expectedKey = Buffer.from(hashHex, 'hex');
    if (salt.length < 8 || expectedKey.length < 16) {
      return false;
    }

    const candidateKey = await deriveKeyAsync(password, salt, expectedKey.length, {
      N: n,
      r,
      p
    });

    if (candidateKey.length !== expectedKey.length) {
      return false;
    }

    return timingSafeEqual(candidateKey, expectedKey);
  } catch {
    return false;
  }
}
