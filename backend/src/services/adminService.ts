// src/services/adminService.ts
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { users, userStats, messages, badges, posts } from '../db/schema';
import { eq, desc } from 'drizzle-orm';

export class AdminService {
  private db: ReturnType<typeof drizzle>;

  constructor(databaseUrl: string) {
    const sql = neon(databaseUrl);
    this.db = drizzle(sql);
  }

  async createUser(email: string, isAdmin: boolean) {
    const existingUser = await this.db.select().from(users).where(eq(users.email, email)).execute();
    if (existingUser.length) {
      throw new Error('Usuário já existe.');
    }

    await this.db.insert(users).values({ email }).execute();
    const newUser = await this.db.select().from(users).where(eq(users.email, email)).execute();

    if (isAdmin) {
      await this.db.update(users)
        .set({ isAdmin: true })
        .where(eq(users.id, newUser[0].id))
        .execute();
    }

    return { message: 'Usuário criado com sucesso!', userId: newUser[0].id };
  }

  async getAllUsers() {
    return await this.db
      .select({ email: users.email, streak: userStats.current_streak, max_streak: userStats.max_streak, total_opens: userStats.total_opens })
      .from(users)
      .innerJoin(userStats, eq(users.id, userStats.user_id))
      .orderBy(desc(userStats.current_streak))
      .execute();
  }

  async getAllPosts() {
    return await this.db.select().from(posts).execute();
  }

  async getAllBadges() {
    return await this.db.select().from(badges).execute();
  }

  async createBadge(name: string, type: string) {
    await this.db.insert(badges).values({ name, type }).execute();
    return { message: 'Badge criada com sucesso!' };
  }

  async getAllMessages() {
    return await this.db.select().from(messages).execute();
  }

  async createMessage(text: string, type: string, min_streak: number) {
    await this.db.insert(messages).values({ text, type, min_streak }).execute();
    return { message: 'Mensagem criada com sucesso!' };
  }
}