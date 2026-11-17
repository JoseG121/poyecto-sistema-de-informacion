import { z } from 'zod';

export const paginacionQuerySchema = z.object({
  pagina: z.coerce
    .number()
    .int()
    .min(1, 'La página debe ser mayor o igual a 1')
    .default(1),
  limite: z.coerce
    .number()
    .int()
    .min(1, 'El límite debe ser mayor o igual a 1')
    .max(100, 'El límite no puede ser mayor a 100')
    .default(20),
});

export type PaginacionQuery = z.infer<typeof paginacionQuerySchema>;
