import { Hono } from 'hono';
import { sign, verify } from 'hono/jwt';
import { drizzle } from 'drizzle-orm/neon-http';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { neon } from '@neondatabase/serverless';

const userRoutes = new Hono<{ Bindings: { DATABASE_URL: string; JWT_SECRET: string }, Variables: { user?: { id: number; email: string } } }>();

userRoutes.post('/login', async (c) => {
  const { email } = await c.req.json();
  const sql = neon(c.env.DATABASE_URL);
  const db = drizzle(sql);

  let user = await db.select().from(users).where(eq(users.email, email)).execute();

  if (!user.length) {
    const newUser = await db.insert(users).values({ email }).returning();
    user = newUser;
  }

  const token = await sign({ id: user[0].id, email: user[0].email }, c.env.JWT_SECRET);
  return c.json({ token });
});

// Middleware de autenticação
userRoutes.use('/api/*', async (c, next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader) return c.json({ error: 'Não autorizado' }, 401);

  const token = authHeader.split(' ')[1];
  try {
    const payload = await verify(token, c.env.JWT_SECRET);
    c.set('user', payload as { id: number; email: string });
    await next();
  } catch {
    return c.json({ error: 'Token inválido' }, 401);
  }
});

// Rota protegida
userRoutes.get('/api/me', async (c) => {
  const user = c.get('user');
  if (!user) return c.json({ error: 'Usuário não encontrado' }, 401);
  return c.json({ user });
});

export default userRoutes;
