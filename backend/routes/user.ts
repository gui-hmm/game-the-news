import { Hono } from 'hono';
import { sign, verify } from 'hono/jwt';
import { drizzle } from 'drizzle-orm/neon-http';
import { users, userStats, emailOpens, messages, loginAttempts, posts } from '../db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { neon } from '@neondatabase/serverless';

const userRoutes = new Hono<{ 
  Bindings: { 
    DATABASE_URL: string; 
    JWT_SECRET: string; 
    BEEHIIV_API_KEY: string 
  }, Variables: { 
    user?: { id: number; email: string } 
  } 
}>();

userRoutes.post('/login', async (c) => {
  const { email } = await c.req.json();
  const sql = neon(c.env.DATABASE_URL);
  const db = drizzle(sql);

  // Verifica se o usuário existe
  let user = await db.select().from(users).where(eq(users.email, email)).execute();

  if (!user.length) {
    // Se o usuário não existe, cria um novo usuário
    const newUser = await db.insert(users).values({ email }).returning();
    user = newUser;
  }

  // Verifica se o usuário atingiu o limite de tentativas de login
  const attempts = await db.select().from(loginAttempts).where(eq(loginAttempts.email, email)).execute();

  if (attempts.length > 0) {
    const attemptData = attempts[0];

    // Verifica se a quantidade de tentativas é maior ou igual a 5 e que attempts não seja nulo
    if (attemptData.attempts !== null && attemptData.attempts >= 5) {
      const lastAttempt = attemptData.last_attempt;

      if (lastAttempt !== null) {
        const now = new Date();
        const lockDuration = 10 * 60 * 1000; // 10 minutos em milissegundos
        
        // Se o tempo desde a última tentativa for menor que o lockDuration, bloqueia o login
        const lastAttemptDate = new Date(lastAttempt);  // Garantindo que last_attempt seja um objeto Date
        if (now.getTime() - lastAttemptDate.getTime() < lockDuration) {
          return c.json({ error: 'Número máximo de tentativas de login excedido. Tente novamente mais tarde.' }, 429);
        }
      } else {
        // Caso last_attempt seja null, você pode decidir o que fazer (ex: liberar tentativas)
        return c.json({ error: 'Tentativa de login não registrada corretamente.' }, 400);
      }
    }
  }

  // Gera o token de autenticação
  const token = await sign({ id: user[0].id, email: user[0].email, isAdmin: user[0].isAdmin }, c.env.JWT_SECRET);

  // Registra uma tentativa de login bem-sucedido
  const now = new Date();
  if (attempts.length > 0) {
    await db.update(loginAttempts)
      .set({ attempts: 0, last_attempt: now })  // Resetando tentativas após um login bem-sucedido
      .where(eq(loginAttempts.email, email))
      .execute();
  } else {
    await db.insert(loginAttempts).values({ email, attempts: 0, last_attempt: now }).execute();
  }

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

// Processa abertura de e-mails via Webhook
userRoutes.post('/webhook/email-open', async (c) => {
  const { email, id: edition_id, utm_source, utm_medium, utm_campaign, utm_channel, api_url } = await c.req.json();
  const sql = neon(c.env.DATABASE_URL);
  const db = drizzle(sql);

  if (!email || !edition_id || !api_url) {
    return c.json({ error: 'Dados inválidos do webhook' }, 400);
  }  

  let user = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .execute();
  
  let userId;

  if (!user.length) {
    const newUser = await db.insert(users).values({ email }).returning();
    userId = newUser[0].id;
    await db.insert(userStats).values({
      user_id: userId,
      current_streak: 1,
      max_streak: 1,
      total_opens: 1,
      last_active: new Date()
    }).execute();
  } else {
    userId = user[0].id;
  }

  const existingOpen = await db
    .select()
    .from(emailOpens)
    .where(and(eq(emailOpens.user_id, userId), eq(emailOpens.edition_id, edition_id)))
    .execute();

  if (!existingOpen.length) {
    await db.insert(emailOpens).values({
      user_id: userId,
      edition_id,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_channel
    }).execute();
  }

  const stats = await db.select().from(userStats).where(eq(userStats.user_id, userId)).execute();
  const today = new Date();
  const lastActive = stats[0]?.last_active ? new Date(stats[0].last_active) : null;
  let newStreak = stats[0]?.current_streak || 0;
  let newMaxStreak = stats[0]?.max_streak || 0;
  const totalOpens = (stats[0]?.total_opens || 0) + 1;

  if (lastActive) {
    const diffDays = Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
    const lastDay = lastActive.getDay();
    const todayDay = today.getDay();

    if (diffDays === 1 || (diffDays === 2 && lastDay === 6 && todayDay === 1)) {
      newStreak += 1;
      newMaxStreak = Math.max(newStreak, newMaxStreak);
    } else if (diffDays > 1) {
      newStreak = 1;
    }
  } else {
    newStreak = 1;
  }

  await db.update(userStats)
    .set({
      current_streak: newStreak,
      max_streak: newMaxStreak,
      total_opens: totalOpens,
      last_active: today
    })
    .where(eq(userStats.user_id, userId))
    .execute();

  // 🔹 Requisição para API da Beehiiv utilizando o link recebido no webhook
  try {
    const beehiivResponse = await fetch(api_url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${c.env.BEEHIIV_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!beehiivResponse.ok) {
      throw new Error('Erro ao buscar dados do post na API do Beehiiv');
    }

    const postDetails = await beehiivResponse.json();

    // Verifica se o post já existe
    const existingPost = await db
      .select()
      .from(posts)
      .where(eq(posts.id, postDetails.id))
      .execute();

    if (existingPost.length > 0) {
      // Atualiza se o post já existe
      await db.update(posts)
        .set({
          title: postDetails.title,
          subtitle: postDetails.subtitle,
          authors: postDetails.authors,
          status: postDetails.status,
          subject_line: postDetails.subject_line,
          preview_text: postDetails.preview_text,
          slug: postDetails.slug,
          thumbnail_url: postDetails.thumbnail_url,
          web_url: postDetails.web_url,
          audience: postDetails.audience,
          platform: postDetails.platform,
          content_tags: postDetails.tags,
          hidden_from_feed: postDetails.hidden_from_feed,
          publish_date: postDetails.publish_date ? new Date(postDetails.publish_date) : null,
          displayed_date: postDetails.displayed_date ? new Date(postDetails.displayed_date) : null,
          meta_default_description: postDetails.meta_default_description,
          meta_default_title: postDetails.meta_default_title,
          content: postDetails.content,
          stats: postDetails.stats,
        })
        .where(eq(posts.id, postDetails.id))
        .execute();
    } else {
      // Insere um novo post
      await db.insert(posts).values({
        id: postDetails.id,
        title: postDetails.title,
        subtitle: postDetails.subtitle,
        authors: postDetails.authors,
        created: new Date(postDetails.created_at),
        status: postDetails.status,
        subject_line: postDetails.subject_line,
        preview_text: postDetails.preview_text,
        slug: postDetails.slug,
        thumbnail_url: postDetails.thumbnail_url,
        web_url: postDetails.web_url,
        audience: postDetails.audience,
        platform: postDetails.platform,
        content_tags: postDetails.tags,
        hidden_from_feed: postDetails.hidden_from_feed,
        publish_date: postDetails.publish_date ? new Date(postDetails.publish_date) : null,
        displayed_date: postDetails.displayed_date ? new Date(postDetails.displayed_date) : null,
        meta_default_description: postDetails.meta_default_description,
        meta_default_title: postDetails.meta_default_title,
        content: postDetails.content,
        stats: postDetails.stats,
      }).execute();
    }
  } catch (error) {
    console.error('Erro ao buscar ou salvar post:', error);
  }

  return c.json({ message: 'Abertura registrada, post atualizado e streak atualizado!', newStreak });
});

// Obtém estatísticas do usuário
userRoutes.get('/api/stats', async (c) => {
  const sql = neon(c.env.DATABASE_URL);
  const db = drizzle(sql);
  const user = c.get('user');
  if (!user) return c.json({ error: "Não autorizado" }, 401);

  const stats = await db.select().from(userStats).where(eq(userStats.user_id, user.id)).execute();
  const messagesData = await db.select().from(messages).where(eq(messages.min_streak, stats[0]?.current_streak || 0)).execute();

  return c.json({
    streak: stats[0]?.current_streak || 0,
    max_streak: stats[0]?.max_streak || 0,
    total_opens: stats[0]?.total_opens || 0,
    message: messagesData.length ? messagesData[0].text : null,
  });
});

// Ranking de usuários com maior streak
userRoutes.get('/api/ranking', async (c) => {
  const sql = neon(c.env.DATABASE_URL);
  const db = drizzle(sql);
  const user = c.get('user');

  if (!user) return c.json({ error: "Não autorizado" }, 401);

  // Obtém todos os usuários ordenados por streak
  const allUsers = await db
    .select({ email: users.email, streak: userStats.current_streak })
    .from(users)
    .innerJoin(userStats, eq(users.id, userStats.user_id))
    .orderBy(desc(userStats.current_streak))
    .execute();

  // Encontra a posição do usuário logado no ranking
  const userPosition = allUsers.findIndex((u) => u.email === user.email) + 1 || null;

  return c.json({
    userPosition,
  });
});

export default userRoutes;
