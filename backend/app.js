import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import dossierRoutes from './routes/dossiers.js';
import ticketRoutes from './routes/tickets.js';
import paymentRoutes from './routes/payments.js';
import messageRoutes from './routes/messages.js';

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dossiers', dossierRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/messages', messageRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'capitune-backend' });
});

app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'capitune-backend', message: 'API is running' });
});

export default app;
