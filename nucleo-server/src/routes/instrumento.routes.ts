import { Router } from 'express';
import {
  getInstrumentoById,
  getInstrumentos,
  getVerificarSerial,
  postAsignarInstrumento,
  postInstrumento,
  postLiberarInstrumento,
} from '../controllers/instrumento.controller';
import { autenticar } from '../middleware/auth.middleware';
import { requireRol } from '../middleware/role.middleware';
import { validateBody } from '../middleware/validate.middleware';
import {
  asignarInstrumentoSchema,
  crearInstrumentoSchema,
} from '../schemas/instrumento.schema';

const router = Router();

router.use(autenticar);

router.get('/', getInstrumentos);
router.get('/verificar-serial', getVerificarSerial);
router.post('/asignar', requireRol('admin'), validateBody(asignarInstrumentoSchema), postAsignarInstrumento);
router.post('/:id/liberar', requireRol('admin'), postLiberarInstrumento);
router.get('/:id', getInstrumentoById);
router.post('/', requireRol('admin'), validateBody(crearInstrumentoSchema), postInstrumento);

export { router as instrumentoRouter };
