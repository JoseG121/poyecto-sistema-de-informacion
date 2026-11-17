import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { login, logout, perfil, registro } from '../controllers/autenticacion.controller';
import { autenticar } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { loginSchema, registroSchema } from '../schemas/autenticacion.schema';

const router = Router();

const registroLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: { mensaje: 'Demasiados registros desde esta IP. Intenta de nuevo más tarde.' },
  },
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 25,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: { mensaje: 'Demasiados intentos de inicio de sesión. Intenta de nuevo más tarde.' },
  },
});

router.post('/registro', registroLimiter, validateBody(registroSchema), registro);
router.post('/login', loginLimiter, validateBody(loginSchema), login);
router.get('/perfil', autenticar, perfil);
router.post('/logout', autenticar, logout);

export { router as autenticacionRouter };
