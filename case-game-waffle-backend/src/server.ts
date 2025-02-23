import { Hono } from 'hono';
import { cors } from "hono/cors";
import userRoutes from './routes/userRoute';
import adminRoutes from './routes/adminRoute';

const app = new Hono();

app.use(
    "*",
    cors({
      origin: "*", 
      allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowHeaders: ["Content-Type", "Authorization"],
      maxAge: 600, // Tempo que o preflight pode ser armazenado em cache (10 minutos)
    })
);

app.get('/', (c) => c.text('API Rodando 🚀'));

app.route('/', userRoutes);

app.route('/', adminRoutes);

export default app;
