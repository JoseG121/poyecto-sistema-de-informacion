export const instrumentCategories = ['cuerda', 'madera', 'metal', 'percusion'] as const;

export type InstrumentCategory = (typeof instrumentCategories)[number];

export const instrumentCatalog: Record<Exclude<InstrumentCategory, 'percusion'>, readonly string[]> = {
  cuerda: ['violín', 'viola', 'chelo', 'contrabajo', 'cuatro', 'guitarra'],
  madera: ['flauta', 'oboe', 'clarinete', 'fagot'],
  metal: ['trompeta', 'corno', 'trombón', 'tuba'],
};

export const categoryLabels: Record<InstrumentCategory, string> = {
  cuerda: 'Cuerda',
  madera: 'Madera',
  metal: 'Metales',
  percusion: 'Percusión',
};

/**
 * Quita acentos, espacios externos y pasa a minúsculas para comparar
 * entradas como "Violín", "VIOLIN" o "percusión".
 */
export function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

export function resolveCategory(value: string): InstrumentCategory | null {
  const normalized = normalizeText(value);
  const match = instrumentCategories.find((category) => category === normalized);
  return match ?? null;
}

/**
 * Devuelve el nombre canónico del catálogo para la categoría indicada.
 * En percusión se acepta cualquier texto libre no vacío.
 */
export function resolveInstrumentName(category: InstrumentCategory, value: string): string | null {
  const trimmed = value.trim();

  if (trimmed.length === 0) {
    return null;
  }

  if (category === 'percusion') {
    return trimmed;
  }

  const normalized = normalizeText(trimmed);
  const match = instrumentCatalog[category].find((name) => normalizeText(name) === normalized);

  return match ?? null;
}

/**
 * La categoría no se almacena en la base de datos: se deduce del nombre.
 * Todo nombre que no pertenezca a un catálogo específico se considera percusión.
 */
export function inferCategory(name: string): InstrumentCategory {
  const normalized = normalizeText(name);

  for (const category of instrumentCategories) {
    if (category === 'percusion') {
      continue;
    }

    const names = instrumentCatalog[category];
    if (names.some((allowed) => normalizeText(allowed) === normalized)) {
      return category;
    }
  }

  return 'percusion';
}
