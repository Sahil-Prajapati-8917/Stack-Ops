import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes.js';
import projectRoutes from './routes/project.routes.js';

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

app.use('/auth', authRoutes);
app.use('/projects', projectRoutes);

export default app;
