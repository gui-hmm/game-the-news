import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { users, userStats, emailOpens, messages, loginAttempts, posts } from '../db/schema';
import { eq, desc, and } from 'drizzle-orm';

interface Post {
  id: string;  // ID único do post
  title: string;  // Título do post
  subtitle: string | null;  // Subtítulo do post (pode ser nulo)
  authors: string[];  // Lista de autores do post
  created_at: string;  // Data de criação do post (em formato ISO 8601)
  status: string;  // Status do post (ex: "draft", "published")
  subject_line: string | null;  // Linha de assunto do post (pode ser nulo)
  preview_text: string | null;  // Texto de pré-visualização do post (pode ser nulo)
  slug: string | null;  // Slug para a URL do post (pode ser nulo)
  thumbnail_url: string | null;  // URL da imagem miniatura do post (pode ser nulo)
  web_url: string;  // URL pública do post
  audience: string;  // Audiência do post (ex: "free", "premium")
  platform: string;  // Plataforma onde o post será exibido (ex: web, email)
  tags: string[];  // Tags associadas ao conteúdo do post (equivalente ao content_tags)
  hidden_from_feed: boolean;  // Se o post está oculto do feed
  publish_date: string | null;  // Data de publicação do post (pode ser nulo)
  displayed_date: string | null;  // Data de exibição do post (pode ser nulo)
  meta_default_description: string | null;  // Descrição meta do post (pode ser nulo)
  meta_default_title: string | null;  // Título meta do post (pode ser nulo)
  content: object | null;  // Conteúdo do post, em formato JSON (HTML para diferentes plataformas)
  stats: object | null;  // Estatísticas de engajamento (como aberturas de e-mails)
}

export class UserService {
  private db: ReturnType<typeof drizzle>;

  constructor(databaseUrl: string, private jwtSecret: string, private beehiivkey: string) {
    const sql = neon(databaseUrl);
    this.db = drizzle(sql);
  }

  async login(email: string, isAdmin: boolean) {
    let user = await this.db.select().from(users).where(eq(users.email, email)).execute();

    if (!user.length) {
      const newUser = await this.db.insert(users).values({ email, isAdmin }).returning();
      user = newUser;
    }

    const attempts = await this.db.select().from(loginAttempts).where(eq(loginAttempts.email, email)).execute();

    if (attempts.length > 0) {
      const attemptData = attempts[0];
      if (attemptData.attempts !== null && attemptData.attempts >= 5) {
        const lastAttempt = attemptData.last_attempt;
        if (lastAttempt !== null) {
          const now = new Date();
          const lockDuration = 10 * 60 * 1000; // 10 minutos
          if (now.getTime() - new Date(lastAttempt).getTime() < lockDuration) {
            throw new Error('Número máximo de tentativas de login excedido. Tente novamente mais tarde.');
          }
        }
      }
    }

    const now = new Date();
    if (attempts.length > 0) {
      await this.db.update(loginAttempts)
        .set({ attempts: 0, last_attempt: now })
        .where(eq(loginAttempts.email, email))
        .execute();
    } else {
      await this.db.insert(loginAttempts).values({ email, attempts: 0, last_attempt: now }).execute();
    }

    return user[0];
  }

  async registerEmailOpen(
    email: string, 
    edition_id: string, 
    utm_source: string, 
    utm_medium: string, 
    utm_campaign: string, 
    utm_channel: string, 
    api_url: string,
    postDetails: Post) {
    
    let user = await this.db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .execute();
    
    let userId;

    if (!user.length) {
      const newUser = await this.db.insert(users).values({ email }).returning();
      userId = newUser[0].id;
      await this.db.insert(userStats).values({
        user_id: userId,
        current_streak: 1,
        max_streak: 1,
        total_opens: 1,
        last_active: new Date()
      }).execute();
    } else {
      userId = user[0].id;
    }

    const existingOpen = await this.db
    .select()
    .from(emailOpens)
    .where(and(eq(emailOpens.user_id, userId), eq(emailOpens.edition_id, edition_id)))
    .execute();

    if (!existingOpen.length) {
      await this.db.insert(emailOpens).values({
        user_id: userId,
        edition_id,
        utm_source,
        utm_medium,
        utm_campaign,
        utm_channel
      }).execute();
    }

    const stats = await this.db
    .select()
    .from(userStats)
    .where(eq(userStats.user_id, userId))
    .execute();

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

    await this.db
      .update(userStats)
      .set({
        current_streak: newStreak,
        max_streak: newMaxStreak,
        total_opens: totalOpens,
        last_active: today
      })
      .where(eq(userStats.user_id, userId))
      .execute();

       // Salva ou atualiza o post no banco de dados
    await this.saveOrUpdatePost(postDetails);
    return { newStreak };
  }

  private async saveOrUpdatePost(postDetails: Post) {
    try {
      console.log(postDetails)
      const postValues = {
        id: postDetails.id,
        title: postDetails.title,
        subtitle: postDetails.subtitle,
        authors: postDetails.authors,
        created: null,
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
      };
  
      // Verifique se todos os campos estão presentes
      console.log("Dados preparados para inserção:", postValues);
  
      // Salve ou atualize o post no banco de dados
      await this.db
        .insert(posts)
        .values(postValues)
        .onConflictDoUpdate({
          target: posts.id,
          set: postValues,
        })
        .execute();
    } catch (error) {
      console.error('Erro ao salvar ou atualizar o post:', error);
      throw new Error('Erro ao atualizar post');
    }
  }
  

  async getUserStats(userId: number) {
    const stats = await this.db.select().from(userStats).where(eq(userStats.user_id, userId)).execute();
    const messagesData = await this.db.select().from(messages).where(eq(messages.min_streak, stats[0]?.current_streak || 0)).execute();

    return {
      streak: stats[0]?.current_streak || 0,
      max_streak: stats[0]?.max_streak || 0,
      total_opens: stats[0]?.total_opens || 0,
      message: messagesData.length ? messagesData[0].text : null,
    };
  }

  async getRanking(userEmail: string) {
    const allUsers = await this.db
      .select({ email: users.email, streak: userStats.current_streak })
      .from(users)
      .innerJoin(userStats, eq(users.id, userStats.user_id))
      .orderBy(desc(userStats.current_streak))
      .execute();

    const userPosition = allUsers.findIndex((u) => u.email === userEmail) + 1 || null;

    return { userPosition };
  }
}