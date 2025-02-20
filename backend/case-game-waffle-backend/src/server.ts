import { Hono } from 'hono';
import userRoutes from './routes/userRoute';
import adminRoutes from './routes/adminRoute';

const app = new Hono();

app.get('/', (c) => c.text('API Rodando 🚀'));

app.route('/', userRoutes);

app.route('/', adminRoutes);

export default app;
