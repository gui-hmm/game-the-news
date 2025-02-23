import { Context } from 'hono';
import { sign } from 'hono/jwt';
import { UserService } from '../services/userService';

interface SubscribeData {
    data: {
      id: string;
      email: string;
      status: string;
      utm_source: string;
      utm_medium: string;
      utm_campaign: string;
      utm_channel: string;
      api_url: string;
    };
}

interface Post {
    data: {
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
    };
}  

export class UserController {
  private userService: UserService;

  constructor(private databaseUrl: string, private jwtSecret: string, private beehiivkey: string) {
    this.userService = new UserService(databaseUrl, jwtSecret, beehiivkey);
  }

  async login(c: Context) {
    try {
        const { email, isAdmin = false } = await c.req.json();
        const user = await this.userService.login(email, isAdmin);
        const token = await sign({ id: user.id, email: user.email, isAdmin: user.isAdmin }, this.jwtSecret);
        return c.json({ token });
    } catch (error) {
        if (error instanceof Error) {
            return c.json({ error: error.message }, 400);
        }
        return c.json({ error: 'Ocorreu um erro inesperado' }, 500);
    }
  }

  async registerEmailOpen(c: Context, email: string, edition_id: string) {
    try {
      // Fazendo a requisição para o primeiro webhook (subscribe)
      const subscribeResponse = await fetch('https://backend.testeswaffle.org/webhooks/case/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
  
      if (!subscribeResponse.ok) {
        const errorDetails : any = await subscribeResponse.json();
        throw new Error(`Erro ao enviar o email para o primeiro webhook: ${errorDetails.message || subscribeResponse.statusText}`);
      }
  
      const subscribeData = await subscribeResponse.json() as SubscribeData;
      const userData = subscribeData.data;

      // Agora, vamos fazer a requisição para o segundo webhook (publicação)
      const publicationResponse = await fetch(`https://backend.testeswaffle.org/webhooks/case/publication/teste/post/${edition_id}`, {
        method: 'GET',
      });
  
      if (!publicationResponse.ok) {
        const errorDetails : any = await publicationResponse.json();
        throw new Error(`Erro ao buscar os detalhes da publicação: ${errorDetails.message || publicationResponse.statusText}`);
      }
  
      const postDetails = await publicationResponse.json() as Post;
      const postData = postDetails.data;
      
  
      const result = await this.userService.registerEmailOpen(
        email,
        edition_id,
        userData.utm_source,
        userData.utm_medium,
        userData.utm_campaign,
        userData.utm_channel,
        userData.api_url,
        postData
      );
  
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