// src/routes/userRoutes.ts
import { Hono } from 'hono';
import { authMiddleware } from '../middleware';
import { UserController } from '../controllers/userController';

const userRoutes = new Hono<{ Bindings: { DATABASE_URL: string; JWT_SECRET: string } }>();

const databaseUrl = process.env.DATABASE_URL;

const jwtSecret = process.env.JWT_SECRET;

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not defined');
} else if (!jwtSecret){
  throw new Error('JWT_SECRET environment variable is not defined');
}

const userController = new UserController(databaseUrl, jwtSecret);

userRoutes.post('/login', (c) => userController.login(c));
userRoutes.post('/webhook/email-open', (c) => userController.registerEmailOpen(c));

userRoutes.use('/api/*', authMiddleware);
userRoutes.get('/api/me', (c) => userController.getMe(c));
userRoutes.get('/api/stats', (c) => userController.getStats(c));
userRoutes.get('/api/ranking', (c) => userController.getRanking(c));

export default userRoutes;