import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { users, userStats, emailOpens, messages, loginAttempts, posts } from '../db/schema';
import { eq, desc, and } from 'drizzle-orm';

export class UserService {
  private db: ReturnType<typeof drizzle>;

  constructor(databaseUrl: string) {
    const sql = neon(databaseUrl);
    this.db = drizzle(sql);
  }

  async login(email: string) {
    let user = await this.db.select().from(users).where(eq(users.email, email)).execute();

    if (!user.length) {
      const newUser = await this.db.insert(users).values({ email }).returning();
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

  async registerEmailOpen(email: string, edition_id: string, utm_source: string, utm_medium: string, utm_campaign: string, utm_channel: string, api_url: string) {
    let user = await this.db.select().from(users).where(eq(users.email, email)).execute();
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

    const existingOpen = await this.db.select().from(emailOpens).where(and(eq(emailOpens.user_id, userId), eq(emailOpens.edition_id, edition_id))).execute();

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

    const stats = await this.db.select().from(userStats).where(eq(userStats.user_id, userId)).execute();
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

    await this.db.update(userStats)
      .set({
        current_streak: newStreak,
        max_streak: newMaxStreak,
        total_opens: totalOpens,
        last_active: today
      })
      .where(eq(userStats.user_id, userId))
      .execute();

      // Chamada para a API externa (Beehiiv)
      try {
        const beehiivResponse = await fetch(api_url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${process.env.BEEHIIV_API_KEY}`,
            'Content-Type': 'application/json'
          }
        });
    
        if (!beehiivResponse.ok) {
          throw new Error('Erro ao buscar dados do post na API do Beehiiv');
        }
    
        const postDetails = await beehiivResponse.json();
    
        const existingPost = await this.db
          .select()
          .from(posts)
          .where(eq(posts.id, postDetails.id))
          .execute();
    
        if (existingPost.length > 0) {
          await this.db.update(posts)
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
          await this.db.insert(posts).values({
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
        throw new Error('Erro ao atualizar post');
      }
    
      return { newStreak };
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