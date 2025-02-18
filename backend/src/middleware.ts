import { verify } from 'hono/jwt';
import { Context } from 'hono';

export const authMiddleware = async (c: Context, next: Function) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader) return c.json({ error: 'Não autorizado' }, 401);

  const token = authHeader.split(' ')[1];
  try {
    const payload = await verify(token, c.env.JWT_SECRET);
    c.set('user', payload);
    await next();
  } catch {
    return c.json({ error: 'Token inválido' }, 401);
  }
};

export const adminAuthMiddleware = async (c: Context, next: Function) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader) return c.json({ error: 'Não autorizado' }, 401);

  const token = authHeader.split(' ')[1];
  try {
    const payload = await verify(token, c.env.JWT_SECRET);
    if (!payload.isAdmin) return c.json({ error: 'Acesso negado' }, 403);
    await next();
  } catch {
    return c.json({ error: 'Token inválido' }, 401);
  }
};