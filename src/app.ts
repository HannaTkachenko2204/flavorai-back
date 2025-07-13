import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import corsConfig from './config/corsConfig';
import authRoutes from './routes/authRoutes';
import protectedRoutes from './routes/protectedRoutes';

dotenv.config();

const app = express();

app.use(cors(corsConfig));
app.use(cookieParser());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/some-protected-route', protectedRoutes);

export default app;
