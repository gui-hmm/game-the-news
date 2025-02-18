import { pgTable, serial, text, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    email: text("email").unique().notNull(),
    isAdmin: boolean("is_admin").default(false),
    created_at: timestamp("created_at").defaultNow(),
});

export const userStats = pgTable("user_stats", {
    id: serial("id").primaryKey(),
    user_id: integer("user_id").references(() => users.id).notNull(),
    current_streak: integer("current_streak").default(0),  // Streak atual
    max_streak: integer("max_streak").default(0),          // Maior streak atingido
    total_opens: integer("total_opens").default(0),        // Total de aberturas
    last_active: timestamp("last_active").defaultNow(),    // Última vez que o usuário foi ativo
});

export const emailOpens = pgTable("email_opens", {
    id: serial("id").primaryKey(),
    user_id: integer("user_id").references(() => users.id).notNull(),
    edition_id: text("edition_id").notNull(), // ID da newsletter
    utm_source: text("utm_source"),
    utm_medium: text("utm_medium"),
    utm_campaign: text("utm_campaign"),
    utm_channel: text("utm_channel"),
    opened_at: timestamp("opened_at").defaultNow(), // Data de abertura
});

export const userBadges = pgTable("user_badges", {
    id: serial("id").primaryKey(),
    user_id: integer("user_id").references(() => users.id).notNull(),
    badge_id: integer("badge_id").references(() => badges.id).notNull(),
    earned_at: timestamp("earned_at").defaultNow(),  // Quando o usuário ganhou a badge
});

export const badges = pgTable("badges", {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),  // Nome do badge, ex: "Leitor Gold", "Lendário"
    type: text("type").notNull(),  // Tipo do badge, ex: "Streak", "Engajamento"
});

export const messages = pgTable("messages", {
    id: serial("id").primaryKey(),
    text: text("text").notNull(),  // Texto da mensagem
    type: text("type").notNull(),  // Tipo da mensagem: "incentivo", "aviso", "parabéns"
    min_streak: integer("min_streak").notNull(),  // A partir de quantos dias mostrar
});

export const loginAttempts = pgTable("login_attempts", {
    email: text("email").references(() => users.email).primaryKey(),  // Referência ao e-mail do usuário
    attempts: integer("attempts").default(0),  // Número de tentativas falhadas
    last_attempt: timestamp("last_attempt").defaultNow(),  // Data e hora da última tentativa de login
});

export const posts = pgTable("posts", {
  id: text("id").primaryKey(),  // ID único do post, vindo da API do Beehiiv
  title: text("title").notNull(),  // Título do post
  subtitle: text("subtitle"),  // Subtítulo do post
  authors: text("authors").array(),  // Array com os autores
  created: timestamp("created").defaultNow(),  // Data de criação do post
  status: text("status").notNull(),  // Status do post (ex: "draft", "published")
  subject_line: text("subject_line"),  // Linha de assunto do post
  preview_text: text("preview_text"),  // Texto de pré-visualização do post
  slug: text("slug"),  // Slug para a URL do post
  thumbnail_url: text("thumbnail_url"),  // URL da imagem miniatura
  web_url: text("web_url"),  // URL pública do post
  audience: text("audience"),  // Audiência (ex: "free", "premium")
  platform: text("platform"),  // Plataforma onde o post será exibido (web, email, etc.)
  content_tags: text("content_tags").array(),  // Tags associadas ao post
  hidden_from_feed: boolean("hidden_from_feed").default(false),  // Se o post está oculto do feed
  publish_date: timestamp("publish_date"),  // Data de publicação do post
  displayed_date: timestamp("displayed_date"),  // Data de exibição do post
  meta_default_description: text("meta_default_description"),  // Descrição meta padrão
  meta_default_title: text("meta_default_title"),  // Título meta padrão
  content: jsonb("content"),  // Conteúdo do post, em formato JSON (HTML para diferentes plataformas)
  stats: jsonb("stats"),  // Estatísticas de engajamento (como aberturas de e-mails, cliques, etc.)
});
