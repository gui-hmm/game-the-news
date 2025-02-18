import { pgTable, serial, text, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";

// ----------------------------------------------------------
// Tabelas de usuários e suas estatísticas
// ----------------------------------------------------------

export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    email: text("email").unique().notNull(),  // E-mail do usuário, deve ser único
    isAdmin: boolean("is_admin").default(false),  // Indica se o usuário é administrador
    created_at: timestamp("created_at").defaultNow(),  // Data de criação do usuário
});

export const userStats = pgTable("user_stats", {
    id: serial("id").primaryKey(),
    user_id: integer("user_id").references(() => users.id).notNull(),  // Referência ao usuário
    current_streak: integer("current_streak").default(0),  // Streak atual (dias consecutivos de atividade)
    max_streak: integer("max_streak").default(0),  // Maior streak atingido
    total_opens: integer("total_opens").default(0),  // Total de aberturas de e-mails
    last_active: timestamp("last_active").defaultNow(),  // Última vez que o usuário foi ativo
});

// ----------------------------------------------------------
// Tabelas relacionadas aos e-mails enviados e aberturas
// ----------------------------------------------------------

export const emailOpens = pgTable("email_opens", {
    id: serial("id").primaryKey(),
    user_id: integer("user_id").references(() => users.id).notNull(),  // Referência ao usuário
    edition_id: text("edition_id").notNull(),  // ID único da edição do e-mail (post)
    utm_source: text("utm_source"),  // Fonte de tráfego do UTM
    utm_medium: text("utm_medium"),  // Meio de tráfego do UTM
    utm_campaign: text("utm_campaign"),  // Campanha do UTM
    utm_channel: text("utm_channel"),  // Canal do UTM
    opened_at: timestamp("opened_at").defaultNow(),  // Data de abertura do e-mail
});

// ----------------------------------------------------------
// Tabelas de badges e conquistas de usuários
// ----------------------------------------------------------

export const userBadges = pgTable("user_badges", {
    id: serial("id").primaryKey(),
    user_id: integer("user_id").references(() => users.id).notNull(),  // Referência ao usuário
    badge_id: integer("badge_id").references(() => badges.id).notNull(),  // Referência ao badge
    earned_at: timestamp("earned_at").defaultNow(),  // Data em que o usuário conquistou o badge
});

export const badges = pgTable("badges", {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),  // Nome do badge, ex: "Leitor Gold"
    type: text("type").notNull(),  // Tipo do badge, ex: "Streak", "Engajamento"
});

// ----------------------------------------------------------
// Tabelas de mensagens e incentivos para usuários
// ----------------------------------------------------------

export const messages = pgTable("messages", {
    id: serial("id").primaryKey(),
    text: text("text").notNull(),  // Texto da mensagem (ex: "Parabéns por completar 7 dias!")
    type: text("type").notNull(),  // Tipo da mensagem, ex: "incentivo", "aviso"
    min_streak: integer("min_streak").notNull(),  // Streak mínima necessária para mostrar a mensagem
});

// ----------------------------------------------------------
// Tabela de tentativas de login dos usuários
// ----------------------------------------------------------

export const loginAttempts = pgTable("login_attempts", {
    email: text("email").references(() => users.email).primaryKey(),  // Referência ao e-mail do usuário
    attempts: integer("attempts").default(0),  // Número de tentativas falhadas
    last_attempt: timestamp("last_attempt").defaultNow(),  // Data da última tentativa de login
});

// ----------------------------------------------------------
// Tabela de posts (relacionada à API do Beehiiv)
// ----------------------------------------------------------

export const posts = pgTable("posts", {
    id: text("id").primaryKey(),  // ID único do post, proveniente da API do Beehiiv
    title: text("title").notNull(),  // Título do post
    subtitle: text("subtitle"),  // Subtítulo do post
    authors: text("authors").array(),  // Lista de autores do post
    created: timestamp("created").defaultNow(),  // Data de criação do post
    status: text("status").notNull(),  // Status do post (ex: "draft", "published")
    subject_line: text("subject_line"),  // Linha de assunto do post
    preview_text: text("preview_text"),  // Texto de pré-visualização do post
    slug: text("slug"),  // Slug para a URL do post
    thumbnail_url: text("thumbnail_url"),  // URL da imagem miniatura do post
    web_url: text("web_url"),  // URL pública do post
    audience: text("audience"),  // Audiência do post (ex: "free", "premium")
    platform: text("platform"),  // Plataforma onde o post será exibido (ex: web, email)
    content_tags: text("content_tags").array(),  // Tags associadas ao conteúdo do post
    hidden_from_feed: boolean("hidden_from_feed").default(false),  // Se o post está oculto do feed
    publish_date: timestamp("publish_date"),  // Data de publicação do post
    displayed_date: timestamp("displayed_date"),  // Data de exibição do post
    meta_default_description: text("meta_default_description"),  // Descrição meta do post
    meta_default_title: text("meta_default_title"),  // Título meta do post
    content: jsonb("content"),  // Conteúdo do post, em formato JSON (HTML para diferentes plataformas)
    stats: jsonb("stats"),  // Estatísticas de engajamento (como aberturas de e-mails)
});
