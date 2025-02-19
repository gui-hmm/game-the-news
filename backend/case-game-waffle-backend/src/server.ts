import { Hono } from 'hono';
import userRoutes from './routes/userRoute';
import adminRoutes from './routes/adminRoute';

const app = new Hono();

app.get('/', (c) => c.text('API Rodando 🚀'));

app.route('/user', userRoutes);

app.route('/admin', adminRoutes);

export default app;
