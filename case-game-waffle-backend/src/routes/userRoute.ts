import { Context, Hono } from 'hono';
import { authMiddleware } from '../middleware';
import { UserController } from '../controllers/userController';

const userRoutes = new Hono<{ Bindings: { DATABASE_URL: string; JWT_SECRET: string, BEEHIIV_API_KEY: string } }>();

function checkEnvVariables(c: Context) {
  const { DATABASE_URL, JWT_SECRET, BEEHIIV_API_KEY } = c.env;

  if (!DATABASE_URL) {
    return { error: 'DATABASE_URL environment variable is not defined' };
  } else if (!JWT_SECRET) {
    return { error: 'JWT_SECRET environment variable is not defined' };
  } else if (!BEEHIIV_API_KEY) {
    return { error: 'BEEHIIV_API_KEY environment variable is not defined' };
  }
  return null;
}

userRoutes.post('/login', (c) => {
  const envCheck = checkEnvVariables(c);
  if (envCheck) return c.json(envCheck, 500);

  const userController = new UserController(c.env.DATABASE_URL, c.env.JWT_SECRET, c.env.BEEHIIV_API_KEY);
  return userController.login(c);
});

userRoutes.post('/', async (c) => {
  const envCheck = checkEnvVariables(c);
  if (envCheck) return c.json(envCheck, 500);

  const email = c.req.query('email');
  const id = c.req.query('id');


  if (!email || !id) {
    return c.json({ error: 'Email ou ID faltando na URL' }, 400);
  }
  const userController = new UserController(c.env.DATABASE_URL, c.env.JWT_SECRET, c.env.BEEHIIV_API_KEY);
  return userController.registerEmailOpen(c, email, id);
});

userRoutes.use('/api/*', authMiddleware);

userRoutes.get('/api/me', (c) => {
  const envCheck = checkEnvVariables(c);
  if (envCheck) return c.json(envCheck, 500);

  const userController = new UserController(c.env.DATABASE_URL, c.env.JWT_SECRET, c.env.BEEHIIV_API_KEY);
  return userController.getMe(c);
});

userRoutes.get('/api/stats', (c) => {
  const envCheck = checkEnvVariables(c);
  if (envCheck) return c.json(envCheck, 500);

  const userController = new UserController(c.env.DATABASE_URL, c.env.JWT_SECRET, c.env.BEEHIIV_API_KEY);
  return userController.getStats(c);
});

userRoutes.get('/api/ranking', (c) => {
  const envCheck = checkEnvVariables(c);
  if (envCheck) return c.json(envCheck, 500);

  const userController = new UserController(c.env.DATABASE_URL, c.env.JWT_SECRET, c.env.BEEHIIV_API_KEY);
  return userController.getRanking(c);
});

export default userRoutes;