import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import 'dotenv/config';

import authRoutes from './routes/auth';
import serviceRoutes from './routes/services';
import professionalRoutes from './routes/professionals';
import appointmentRoutes from './routes/appointments';
import availabilityRoutes from './routes/availability';
import reportsRoutes from './routes/reports';
import businessProfileRoutes from './routes/businessProfile';
import { errorHandler } from './middleware/errorHandler';

// Ensure uploads directory exists at startup
const uploadsDir = path.join(__dirname, '../uploads/profiles');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const app = express();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// Serve uploaded files (logos, etc.)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/professionals', professionalRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/business-profile', businessProfileRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.use(errorHandler);

export default app;
