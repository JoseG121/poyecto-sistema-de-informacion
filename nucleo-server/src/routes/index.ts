import { Router } from 'express';
import { autenticacionRouter } from './autenticacion.routes';
import { estudianteRouter } from './estudiante.routes';
import { instrumentoRouter } from './instrumento.routes';

const router = Router();

router.use('/autenticacion', autenticacionRouter);
router.use('/estudiantes', estudianteRouter);
router.use('/instrumentos', instrumentoRouter);

export { router as apiRouter };
