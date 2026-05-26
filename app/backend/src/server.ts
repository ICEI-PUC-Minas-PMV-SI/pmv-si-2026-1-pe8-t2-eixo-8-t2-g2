import './utils/Env';
import express from 'express';
import { Env } from './utils/Env';
import { HttpCode } from './utils/HttpCode';
import { ResponseUtil } from './utils/ResponseUtil';

import { Router } from './Router';
import { MiddlewareManager } from './MiddlewareManager';
import { AppError } from './error/AppError';
import type { Response, NextFunction, GenericRequest } from './@types';
import cors from 'cors';
const app = express();
const PORT = parseInt(Env.get('SRV_PORT', '3000'));

app.use(cors({ origin: '*' }));
app.set('trust proxy', 1);

app.get('/', (_req, res) => {
  res.type('html').send(`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8"/>
        <title>Express on Vercel</title>
        <link rel="stylesheet" href="/style.css" />
      </head>
      <body>
        <nav>
          <a href="/">Home</a>
          <a href="/about">About</a>
          <a href="/api-data">API Data</a>
          <a href="/healthz">Health</a>
        </nav>
        <h1>Welcome to Express on Vercel 🚀</h1>
        <p>This is a minimal example without a database or forms.</p>
        <img src="/logo.png" alt="Logo" width="120" />
      </body>
    </html>
  `);
});

MiddlewareManager.register(app);
Router.register(app);

const notFoundHandler = (req: GenericRequest, res: Response) => {
  console.warn(`Route not found: ${req.method} ${req.originalUrl}`);
  return ResponseUtil.handleError(
    res,
    new AppError('Rota não encontrada', HttpCode.NOT_FOUND, {
      path: req.originalUrl,
      method: req.method,
    }),
  );
};

const errorHandler = (
  err: Error,
  req: GenericRequest,
  res: Response,
  _next: NextFunction,
) => {
  console.error('Unhandled error:', err);
  const errorMessage = err.message || 'Erro interno do servidor';
  const statusCode =
    err instanceof AppError ? err.statusCode : HttpCode.INTERNAL_SERVER_ERROR;
  const errorData = {
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
    ...(err instanceof AppError ? { statusCode: err.statusCode, data: err.data } : {}),
  };
  // logger.error(`${req.method} ${req.path}: ${errorMessage}`);

  return ResponseUtil.handleError(
    res,
    new AppError(errorMessage, statusCode, errorData, err),
  );
};

app.use(notFoundHandler);
app.use(errorHandler);

if (Env.isDevelopment()) {
  console.log('Running in development mode');
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

export default app;
