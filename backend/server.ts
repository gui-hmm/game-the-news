import { Hono } from 'hono';
import userRoutes from './routes/user';
import adminRoutes from './routes/admin';

const app = new Hono();

// Rota padrão
app.get('/', (c) => c.text('API Rodando 🚀'));

// Importa as rotas de usuário
app.route('/user', userRoutes);

// Importa as rotas de administrador
app.route('/admin', adminRoutes);

export default app;
