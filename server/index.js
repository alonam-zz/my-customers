import express from "express";
import path from "path";
import { fileURLToPath } from "url";

import pool from "./db.js";
import "./jobs/score.cron.js";

import dotenv from 'dotenv';
import cookieParser from "cookie-parser";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

import customersRoutes  from './routes/customers.routes.js';                                            
import productsRoutes  from './routes/products.routes.js';
import servicesRoutes from './routes/services.routes.js';
import employeesRoutes from './routes/employees.routes.js';
import techniciansRoutes from './routes/technicians.routes.js';
import supportAgentsRoutes from './routes/supportAgents.routes.js';
import serviceCallsRoutes from './routes/serviceCalls.routes.js';
import serviceCallLinesRoutes from './routes/serviceCallLines.routes.js';
import reportsRoutes from './routes/reports.routes.js';
import logsRoutes from './routes/logs.routes.js';
import areasRoutes from './routes/areas.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';

import authRoutes from './routes/auth.routes.js';

import { requireAuth } from './middlewares/auth.middleware.js';
import { requireRole } from "./middlewares/auth.middleware.js";

const app = express();
app.use(express.json());
app.use(cookieParser());


// Load .env from the parent directory (project root)
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// ----- public routes (no auth) -----
app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);

// ----- protected routes (require a valid token) -----
app.use('/api/customers', requireAuth, customersRoutes);
app.use('/api/employees', requireAuth, employeesRoutes);
app.use('/api/technicians', requireAuth, techniciansRoutes);
app.use('/api/supportAgents', requireAuth, supportAgentsRoutes);
app.use('/api/products', requireAuth, productsRoutes);
app.use('/api/services', requireAuth, servicesRoutes);
app.use('/api/serviceCalls', requireAuth, serviceCallsRoutes);
app.use('/api/serviceCallLines', requireAuth, serviceCallLinesRoutes);
app.use('/api/reports', requireAuth, requireRole("admin", "manager"),reportsRoutes);
app.use('/api/logs', requireAuth,requireRole("admin", "manager"), logsRoutes);
app.use('/api/dashboard', requireAuth,requireRole("admin", "manager"), dashboardRoutes);
app.use('/api/areas', requireAuth, areasRoutes);



const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => console.log(`API running on ${PORT}`));
