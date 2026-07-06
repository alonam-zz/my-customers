import express from "express";
import pool from "./db.js";

import dotenv from 'dotenv';
import cookieParser from "cookie-parser";

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

import authRoutes from './routes/auth.routes.js';

const app = express();
app.use(express.json());
app.use(cookieParser());


// Load .env from the parent directory (project root)
dotenv.config({ path: './.env' });

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use('/api/customers', customersRoutes);
app.use('/api/employees', employeesRoutes);
app.use('/api/technicians', techniciansRoutes);
app.use('/api/supportAgents', supportAgentsRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/serviceCalls', serviceCallsRoutes);
app.use('/api/serviceCallLines', serviceCallLinesRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/logs', logsRoutes);



console.log(process.env.PORT )
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => console.log(`API on http://localhost:${PORT}`));
