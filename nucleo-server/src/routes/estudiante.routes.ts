import { Router } from 'express';
import {
  deleteEstudiante,
  getEstudianteById,
  getEstudiantes,
  getPlanillaEstudiante,
  postEstudiante,
  putEstudiante,
} from '../controllers/estudiante.controller';
import { autenticar } from '../middleware/auth.middleware';
import { requireRol } from '../middleware/role.middleware';
import { validateBody } from '../middleware/validate.middleware';
import {
  actualizarEstudianteSchema,
  crearEstudianteSchema,
} from '../schemas/estudiante.schema';

const router = Router();

router.use(autenticar);

router.get('/', getEstudiantes);
router.get('/:id/planilla', getPlanillaEstudiante);
router.get('/:id', getEstudianteById);

router.post('/', requireRol('admin'), validateBody(crearEstudianteSchema), postEstudiante);
router.put('/:id', requireRol('admin'), validateBody(actualizarEstudianteSchema), putEstudiante);
router.delete('/:id', requireRol('admin'), deleteEstudiante);

export { router as estudianteRouter };
