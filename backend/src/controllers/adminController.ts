import { Context } from 'hono';
import { AdminService } from '../services/adminService';

export class AdminController {
  private adminService: AdminService;

  constructor(databaseUrl: string) {
    this.adminService = new AdminService(databaseUrl);
  }

  async createUser(c: Context) {
    try{
        const { email, isAdmin } = await c.req.json();
        const result = await this.adminService.createUser(email, isAdmin);
        return c.json(result);
    } catch (error) {
        if (error instanceof Error) {
            return c.json({ error: error.message }, 400);
        }
        return c.json({ error: 'Ocorreu um erro inesperado' }, 500);
    }
  }

  async getAllUsers(c: Context) {
    try {
        const users = await this.adminService.getAllUsers();
        return c.json({ users });
    } catch (error) {
        if (error instanceof Error) {
            return c.json({ error: error.message }, 400);
        }
        return c.json({ error: 'Ocorreu um erro inesperado' }, 500);
    }
  }

  async getAllPosts(c: Context) {
    try {
        const posts = await this.adminService.getAllPosts();
        return c.json(posts);
    } catch (error) {
        if (error instanceof Error) {
            return c.json({ error: error.message }, 400);
        }
        return c.json({ error: 'Ocorreu um erro inesperado' }, 500);
    }
  }

  async getAllBadges(c: Context) {
    try {
        const badges = await this.adminService.getAllBadges();
        return c.json({ badges });
    } catch (error) {
        if (error instanceof Error) {
            return c.json({ error: error.message }, 400);
        }
        return c.json({ error: 'Ocorreu um erro inesperado' }, 500);
    }
  }

  async createBadge(c: Context) {
    try {
        const { name, type } = await c.req.json();
        const result = await this.adminService.createBadge(name, type);
        return c.json(result);
    } catch (error) {
        if (error instanceof Error) {
            return c.json({ error: error.message }, 400);
        }
        return c.json({ error: 'Ocorreu um erro inesperado' }, 500);
    }
  }

  async getAllMessages(c: Context) {
    try {
        const messages = await this.adminService.getAllMessages();
        return c.json({ messages });
    } catch (error) {
        if (error instanceof Error) {
            return c.json({ error: error.message }, 400);
        }
        return c.json({ error: 'Ocorreu um erro inesperado' }, 500);
    }
  }

  async createMessage(c: Context) {
    try {
        const { text, type, min_streak } = await c.req.json();
        const result = await this.adminService.createMessage(text, type, min_streak);
        return c.json(result);
    } catch (error) {
        if (error instanceof Error) {
            return c.json({ error: error.message }, 400);
        }
        return c.json({ error: 'Ocorreu um erro inesperado' }, 500);
    }
  }
}