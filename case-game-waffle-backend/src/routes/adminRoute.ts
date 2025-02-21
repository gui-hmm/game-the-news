import { Context, Hono } from 'hono';
import { adminAuthMiddleware } from '../middleware';
import { AdminController } from '../controllers/adminController';

const adminRoutes = new Hono<{ Bindings: { DATABASE_URL: string } }>();

function checkEnvDatabaseUrl(c: Context) {
  const DATABASE_URL = c.env.DATABASE_URL;

  if (!DATABASE_URL) {
    return { error: 'DATABASE_URL environment variable is not defined' };
  }

  return null;
}

adminRoutes.use('/admin/*', adminAuthMiddleware);

adminRoutes.post('/admin/create-user', (c) => {
  const envCheck = checkEnvDatabaseUrl(c);
  if (envCheck) return c.json(envCheck, 500);

  const adminController = new AdminController(c.env.DATABASE_URL);
  return adminController.createUser(c);
});

adminRoutes.get('/admin/users', (c) => {
  const envCheck = checkEnvDatabaseUrl(c);
  if (envCheck) return c.json(envCheck, 500);

  const adminController = new AdminController(c.env.DATABASE_URL);
  return adminController.getAllUsers(c);
});

adminRoutes.get('/admin/posts', (c) => {
  const envCheck = checkEnvDatabaseUrl(c);
  if (envCheck) return c.json(envCheck, 500);

  const adminController = new AdminController(c.env.DATABASE_URL);
  return adminController.getAllPosts(c);
});

adminRoutes.get('/admin/badges', (c) => {
  const envCheck = checkEnvDatabaseUrl(c);
  if (envCheck) return c.json(envCheck, 500);

  const adminController = new AdminController(c.env.DATABASE_URL);
  return adminController.getAllBadges(c);
});

adminRoutes.post('/admin/badges', (c) => {
  const envCheck = checkEnvDatabaseUrl(c);
  if (envCheck) return c.json(envCheck, 500);

  const adminController = new AdminController(c.env.DATABASE_URL);
  return adminController.createBadge(c);
});

adminRoutes.get('/admin/messages', (c) => {
  const envCheck = checkEnvDatabaseUrl(c);
  if (envCheck) return c.json(envCheck, 500);

  const adminController = new AdminController(c.env.DATABASE_URL);
  return adminController.getAllMessages(c);
});

adminRoutes.post('/admin/messages', (c) => {
  const envCheck = checkEnvDatabaseUrl(c);
  if (envCheck) return c.json(envCheck, 500);

  const adminController = new AdminController(c.env.DATABASE_URL);
  return adminController.createMessage(c);
});

export default adminRoutes;