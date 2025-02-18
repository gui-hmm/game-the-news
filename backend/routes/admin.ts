import { Hono } from 'hono';
import { verify } from 'hono/jwt';
import { drizzle } from 'drizzle-orm/neon-http';
import { users, userStats, messages, badges, posts } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import { neon } from '@neondatabase/serverless';

const adminRoutes = new Hono<{ Bindings: { DATABASE_URL: string; JWT_SECRET: string } }>();

// Middleware de autenticação para admins
adminRoutes.use('/admin/*', async (c, next) => {
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
});

// Rota para criar um novo usuário e definir se é admin
adminRoutes.post('/admin/create-user', async (c) => {
    const { email, isAdmin } = await c.req.json();  // Recebe email e a flag isAdmin
  
    const sql = neon(c.env.DATABASE_URL);
    const db = drizzle(sql);
  
    // Verifica se o email já está registrado
    let existingUser = await db.select().from(users).where(eq(users.email, email)).execute();
    if (existingUser.length) {
      return c.json({ error: 'Usuário já existe.' }, 400);
    }
  
    // Criação do novo usuário
    await db.insert(users).values({ email }).execute();
    const newUser = await db.select().from(users).where(eq(users.email, email)).execute();
  
    // Se o parâmetro isAdmin for passado como true, atualiza o campo isAdmin para true
    if (isAdmin) {
      await db.update(users)
        .set({ isAdmin: true })
        .where(eq(users.id, newUser[0].id))
        .execute();
    }
  
    return c.json({ message: 'Usuário criado com sucesso!', userId: newUser[0].id });
});  

// Exibir todos os usuários e estatísticas
adminRoutes.get('/admin/users', async (c) => {
  const sql = neon(c.env.DATABASE_URL);
  const db = drizzle(sql);

  const allUsers = await db
    .select({ email: users.email, streak: userStats.current_streak, max_streak: userStats.max_streak, total_opens: userStats.total_opens })
    .from(users)
    .innerJoin(userStats, eq(users.id, userStats.user_id))
    .orderBy(desc(userStats.current_streak))
    .execute();

  return c.json({ users: allUsers });
});

// Rota para exibir os dados no dashboard
adminRoutes.get("/admin/posts", async (c) => {
    const sql = neon(c.env.DATABASE_URL);
    const db = drizzle(sql);    
    const allPosts = await db.select().from(posts).execute();
    return c.json(allPosts);
});

// Gerenciar badges
adminRoutes.get('/admin/badges', async (c) => {
  const sql = neon(c.env.DATABASE_URL);
  const db = drizzle(sql);

  const allBadges = await db.select().from(badges).execute();
  return c.json({ badges: allBadges });
});

adminRoutes.post('/admin/badges', async (c) => {
  const { name, type } = await c.req.json();
  const sql = neon(c.env.DATABASE_URL);
  const db = drizzle(sql);

  await db.insert(badges).values({ name, type }).execute();
  return c.json({ message: 'Badge criada com sucesso!' });
});

// Gerenciar mensagens personalizadas
adminRoutes.get('/admin/messages', async (c) => {
  const sql = neon(c.env.DATABASE_URL);
  const db = drizzle(sql);

  const allMessages = await db.select().from(messages).execute();
  return c.json({ messages: allMessages });
});

adminRoutes.post('/admin/messages', async (c) => {
  const { text, type, min_streak } = await c.req.json();
  const sql = neon(c.env.DATABASE_URL);
  const db = drizzle(sql);

  await db.insert(messages).values({ text, type, min_streak }).execute();
  return c.json({ message: 'Mensagem criada com sucesso!' });
});

export default adminRoutes;
