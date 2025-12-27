import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import swaggerUi from 'swagger-ui-express';

import { specs } from './config/swagger';

import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import electionRoutes from './routes/election.routes';
import branchRoutes from './routes/branch.routes';
import voteRoutes from './routes/vote.routes';
import notificationRoutes from './routes/notification.routes';
import dashboardRoutes from './routes/dashboard.routes';
import auditRoutes from './routes/audit.routes';
import uploadRoutes from './routes/upload.routes';

const app = express();

/* ---------------- SECURITY ---------------- */
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));

const limiter = rateLimit({
  windowMs: ((Number(process.env.RATE_LIMIT_WINDOW) || 15) * 60 * 1000),
  max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
});
app.use(limiter);

/* ---------------- PARSING ---------------- */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

/* ---------------- HEALTH ---------------- */
app.get('/api/health', (_req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

/* ---------------- SWAGGER ---------------- */
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'KMPDU E-Voting API'
  })
);

/* ---------------- ROUTES ---------------- */
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/elections', electionRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/upload', uploadRoutes);

/* ---------------- STATIC ---------------- */
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

/* ---------------- ERRORS ---------------- */
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error'
  });
});

app.use('*', (_req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

export default app;
