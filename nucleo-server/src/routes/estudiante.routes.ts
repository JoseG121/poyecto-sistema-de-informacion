import { Router } from 'express';
import {
  getEstudianteById,
  getEstudiantes,
  getPlanillaEstudiante,
  postEstudiante,
} from '../controllers/estudiante.controller';
import { autenticar } from '../middleware/auth.middleware';
import { requireRol } from '../middleware/role.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { crearEstudianteSchema } from '../schemas/estudiante.schema';

const router = Router();

router.use(autenticar);

router.get('/', getEstudiantes);
router.get('/:id/planilla', getPlanillaEstudiante);
router.get('/:id', getEstudianteById);

router.post('/', requireRol('admin'), validateBody(crearEstudianteSchema), postEstudiante);

export { router as estudianteRouter };
