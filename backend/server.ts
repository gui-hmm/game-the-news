import { Hono } from 'hono';
import userRoutes from './routes/user';

const app = new Hono();

// Rota padrão
app.get('/', (c) => c.text('API Rodando 🚀'));

// Importa as rotas de usuário
app.route('/user', userRoutes);

export default app;
