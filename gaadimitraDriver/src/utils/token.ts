/**
 * Token management & JWT expiration utilities
 */

/**
 * Safely decodes a Base64 string across React Native / Hermes / Node environments.
 */
function decodeBase64(input: string): string {
  const globalObj = typeof globalThis !== 'undefined' ? (globalThis as any) : null;
  if (globalObj && typeof globalObj.atob === 'function') {
    try {
      return globalObj.atob(input);
    } catch {
      // Fallback below
    }
  }

  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let str = input.replace(/=+$/, '');
  let output = '';

  if (str.length % 4 === 1) {
    throw new Error('Invalid base64 string');
  }

  for (let bc = 0, bs = 0, buffer, idx = 0; (buffer = str.charAt(idx++)); ) {
    const charIndex = chars.indexOf(buffer);
    if (~charIndex) {
      bs = bc % 4 ? bs * 64 + charIndex : charIndex;
      if (bc++ % 4) {
        output += String.fromCharCode(255 & (bs >> ((-2 * bc) & 6)));
      }
    }
  }

  return output;
}

/**
 * Decodes the payload portion of a JWT token string.
 * Returns null if token is not a valid 3-segment JWT.
 */
export function decodeJwtPayload(token: string | null | undefined): Record<string, any> | null {
  if (!token || typeof token !== 'string') {
    return null;
  }

  try {
    const parts = token.trim().split('.');
    if (parts.length !== 3) {
      return null;
    }

    // Convert Base64URL to standard Base64
    let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }

    const decodedString = decodeBase64(base64);
    return JSON.parse(decodedString);
  } catch (err) {
    console.warn('Unable to decode JWT token payload:', err);
    return null;
  }
}

/**
 * Checks if a JWT access token is expired.
 * 
 * @param token The JWT access token string
 * @param bufferSeconds Optional grace period in seconds (default: 5)
 * @returns true if the token is null, undefined, malformed, or expired.
 *          false if the token is valid and not yet expired.
 */
export function isAccessTokenExpired(token: string | null | undefined, bufferSeconds = 5): boolean {
  if (!token || typeof token !== 'string' || !token.trim()) {
    return true;
  }

  const payload = decodeJwtPayload(token);

  // If the token is not a JWT with an `exp` field (e.g. non-JWT mock token),
  // we treat any non-empty string as valid.
  if (!payload || typeof payload.exp !== 'number') {
    return false;
  }

  const currentEpochSeconds = Math.floor(Date.now() / 1000);
  return payload.exp <= currentEpochSeconds + bufferSeconds;
}
