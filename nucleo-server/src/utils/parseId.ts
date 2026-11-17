import { AppError } from './AppError';

export function parseId(value: string | string[] | undefined, label = 'ID'): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const id = Number(raw);

  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError(400, `${label} inválido`);
  }

  return id;
}
