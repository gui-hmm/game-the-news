const apiUrl: string | undefined = process.env.REACT_APP_API_URL;

if (!apiUrl) {
    throw new Error("A variável de ambiente REACT_APP_API_URL não está definida.");
}

interface ApiResponse<T> {
    data?: T;
    error?: string;
}

interface User {
    id: string;
    email: string;
    isAdmin: boolean;
}

interface Badge {
    id: string;
    name: string;
    type: string;
}

interface Message {
    id: string;
    text: string;
    type: string;
    min_streak: number;
}

interface Post {
    id: string;
    title: string;
    subtitle: string;
    authors: string[];
    created: Date | null;
    status: string;
    subject_line: string;
    preview_text: string;
    slug: string;
    thumbnail_url: string;
    web_url: string;
    audience: string;
    platform: string;
    content_tags: string | null;
    hidden_from_feed: boolean;
    publish_date: string;
    displayed_date: string;
    meta_default_description: string;
    meta_default_title: string;
    content: {
      free: {
        email: string;
        rss: string;
        web: string;
      };
      premium: {
        email: string;
        web: string;
      };
    };
    stats: {
      clicks: Array<{
        total_click_through_rate: number;
        total_clicks: number;
        total_unique_clicks: number;
      }>;
      email: {
        clicks: number;
        delivered: number;
        opens: number;
        recipients: number;
        spam_reports: number;
        unique_clicks: number;
        unique_opens: number;
        unsubscribes: number;
      };
      web: {
        clicks: number;
        views: number;
      };
    };
  }
  

export const fetchUsers = async (token: string): Promise<ApiResponse<User[]>> => {
    try {
        const response = await fetch(`${apiUrl}/admin/users`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
            throw new Error("Erro ao buscar usuários");
        }

        const data = await response.json();
        return { data };
    } catch (error) {
        return { error: error instanceof Error ? error.message : "Erro inesperado ao buscar usuários" };
    }
};

export const fetchPosts = async (token: string): Promise<{ data: Post[] } | { error: string }> => {
    try {
      const response = await fetch(`${apiUrl}/admin/posts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (!response.ok) {
        throw new Error("Erro ao buscar postagens");
      }
  
      const data: Post[] = await response.json();
      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Erro inesperado ao buscar postagens" };
    }
  };
  

export const createUser = async (email: string, isAdmin: boolean): Promise<ApiResponse<User>> => {
    try {
        const response = await fetch(`${apiUrl}/admin/create-user`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, isAdmin }),
        });

        if (!response.ok) {
            throw new Error("Erro ao criar usuário");
        }

        const data = await response.json();
        return { data };
    } catch (error) {
        return { error: error instanceof Error ? error.message : "Erro inesperado ao criar usuário" };
    }
};

export const getAllBadges = async (): Promise<ApiResponse<Badge[]>> => {
    try {
        const response = await fetch(`${apiUrl}/admin/badges`);

        if (!response.ok) {
            throw new Error("Erro ao buscar badges");
        }

        const data = await response.json();
        return { data: data.badges };
    } catch (error) {
        return { error: error instanceof Error ? error.message : "Erro inesperado ao buscar badges" };
    }
};

export const createBadge = async (name: string, type: string): Promise<ApiResponse<Badge>> => {
    try {
        const response = await fetch(`${apiUrl}/admin/badges`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, type }),
        });

        if (!response.ok) {
            throw new Error("Erro ao criar badge");
        }

        const data = await response.json();
        return { data };
    } catch (error) {
        return { error: error instanceof Error ? error.message : "Erro inesperado ao criar badge" };
    }
};

export const getAllMessages = async (): Promise<ApiResponse<Message[]>> => {
    try {
        const response = await fetch(`${apiUrl}/admin/messages`);

        if (!response.ok) {
            throw new Error("Erro ao buscar mensagens");
        }

        const data = await response.json();
        return { data: data.messages };
    } catch (error) {
        return { error: error instanceof Error ? error.message : "Erro inesperado ao buscar mensagens" };
    }
};

export const createMessage = async (
    text: string,
    type: string,
    min_streak: number
): Promise<ApiResponse<Message>> => {
    try {
        const response = await fetch(`${apiUrl}/admin/messages`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text, type, min_streak }),
        });

        if (!response.ok) {
            throw new Error("Erro ao criar mensagem");
        }

        const data = await response.json();
        return { data };
    } catch (error) {
        return { error: error instanceof Error ? error.message : "Erro inesperado ao criar mensagem" };
    }
};
