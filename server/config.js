import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env from the project root (one level up from server/), independent of cwd.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Recipient of every borrow request. Defined here as a constant (overridable via .env).
export const MAIL_TO = process.env.MAIL_TO || 'admin@example.com';

export const config = {
  port: Number(process.env.PORT) || 4000,
  clientOrigin: (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  publicBaseUrl: process.env.PUBLIC_BASE_URL || `http://localhost:${process.env.PORT || 4000}`,
  db: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'myHesed',
  },
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.MAIL_FROM || process.env.SMTP_USER || '',
  },
};

// Pagination guardrails (mirrors the UI rules).
export const PER_PAGE_DEFAULT = 10;
export const PER_PAGE_MAX = 100;
