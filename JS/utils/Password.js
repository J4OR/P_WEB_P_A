const PBKDF2_ITERATIONS = 600_000;

function toBase64(bytes) {
  return btoa(String.fromCharCode(...bytes));
}

export async function hashPassword(password) {
  if (!globalThis.crypto?.subtle || !globalThis.crypto?.getRandomValues) {
    throw new Error("Web Crypto no está disponible en este contexto.");
  }

  const salt = globalThis.crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await globalThis.crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const hash = await globalThis.crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    keyMaterial,
    256
  );

  return [
    "pbkdf2-sha256",
    PBKDF2_ITERATIONS,
    toBase64(salt),
    toBase64(new Uint8Array(hash))
  ].join("$");
}
