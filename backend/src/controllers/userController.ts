import { Context } from 'hono';
import { sign } from 'hono/jwt';
import { UserService } from '../services/userService';

export class UserController {
  private userService: UserService;

  constructor(databaseUrl: string, private jwtSecret: string) {
    this.userService = new UserService(databaseUrl);
  }

  async login(c: Context) {
    try {
        const { email } = await c.req.json();
        const user = await this.userService.login(email);
        const token = await sign({ id: user.id, email: user.email, isAdmin: user.isAdmin }, this.jwtSecret);
        return c.json({ token });
    } catch (error) {
        if (error instanceof Error) {
            return c.json({ error: error.message }, 400);
        }
        return c.json({ error: 'Ocorreu um erro inesperado' }, 500);
    }
  }

  async registerEmailOpen(c: Context) {
    try {
        const { email, id: edition_id, utm_source, utm_medium, utm_campaign, utm_channel, api_url } = await c.req.json();
    
        if (!email || !edition_id || !api_url) {
            return c.json({ error: 'Dados inválidos do webhook' }, 400);
        }
    
        const result = await this.userService.registerEmailOpen(email, edition_id, utm_source, utm_medium, utm_campaign, utm_channel, api_url);
        return c.json({ message: 'Abertura registrada e streak atualizado!', newStreak: result.newStreak });
    } catch (error) {
        if (error instanceof Error) {
            return c.json({ error: error.message }, 400);
        }
        return c.json({ error: 'Ocorreu um erro inesperado' }, 500);
    }
  }

  async getMe(c: Context) { 
    try {
        const user = c.get('user');
        if (!user) return c.json({ error: 'Usuário não encontrado' }, 401);
        return c.json({ user });
    } catch (error) {
        if (error instanceof Error) {
            return c.json({ error: error.message }, 400);
        }
        return c.json({ error: 'Ocorreu um erro inesperado' }, 500);
    }
  }

  async getStats(c: Context) { 
    try {
        const user = c.get('user');
        if (!user) return c.json({ error: 'Não autorizado' }, 401);
        const stats = await this.userService.getUserStats(user.id);
        return c.json(stats);
    } catch (error) {
        if (error instanceof Error) {
            return c.json({ error: error.message }, 400);
        }
        return c.json({ error: 'Ocorreu um erro inesperado' }, 500);
    }
  }

  async getRanking(c: Context) {
    try {
        const user = c.get('user');
        if (!user) return c.json({ error: 'Não autorizado' }, 401);
        const ranking = await this.userService.getRanking(user.email);
        return c.json(ranking);
    } catch (error) {
        if (error instanceof Error) {
            return c.json({ error: error.message }, 400);
        }
        return c.json({ error: 'Ocorreu um erro inesperado' }, 500);
    }
  }
}