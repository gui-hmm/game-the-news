import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    email: text("email").unique().notNull(),
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