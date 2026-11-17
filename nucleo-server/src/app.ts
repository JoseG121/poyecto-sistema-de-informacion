import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { apiRouter } from './routes';
import { errorHandler } from './middleware/error.middleware';
import { notFound } from './middleware/notFound.middleware';

const app = express();

app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: env.corsOrigin }));
app.use(express.json({ limit: '1mb' }));

if (env.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

app.get('/api/salud', (_req, res) => {
  res.json({
    datos: {
      estado: 'ok',
      servicio: 'nucleo-altagracia-server',
      entorno: env.nodeEnv,
      fechaHora: new Date().toISOString(),
    },
  });
});

app.use('/api', apiRouter);
app.use(notFound);
app.use(errorHandler);

export { app };
