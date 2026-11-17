import { createHash, timingSafeEqual } from 'node:crypto';

function digest(value: string): Buffer {
  return createHash('sha256').update(value).digest();
}

/**
 * Compara dos textos en tiempo constante. Se comparan los hashes para que
 * el tamaño de las cadenas no influya en el tiempo de respuesta.
 */
export function safeCompare(value: string, expected: string): boolean {
  return timingSafeEqual(digest(value), digest(expected));
}
