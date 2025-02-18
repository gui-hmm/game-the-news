import { Hono } from 'hono';
import { adminAuthMiddleware } from '../middleware';
import { AdminController } from '../controllers/adminController';

const adminRoutes = new Hono<{ Bindings: { DATABASE_URL: string } }>();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not defined');
}

const adminController = new AdminController(databaseUrl);

adminRoutes.use('/admin/*', adminAuthMiddleware);

adminRoutes.post('/admin/create-user', (c) => adminController.createUser(c));
adminRoutes.get('/admin/users', (c) => adminController.getAllUsers(c));
adminRoutes.get('/admin/posts', (c) => adminController.getAllPosts(c));
adminRoutes.get('/admin/badges', (c) => adminController.getAllBadges(c));
adminRoutes.post('/admin/badges', (c) => adminController.createBadge(c));
adminRoutes.get('/admin/messages', (c) => adminController.getAllMessages(c));
adminRoutes.post('/admin/messages', (c) => adminController.createMessage(c));

export default adminRoutes;