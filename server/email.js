import nodemailer from 'nodemailer';
import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config, MAIL_TO } from './config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, 'public');
const ITEMS_DIR = path.join(__dirname, 'public/items');
const LOGO_PATH = path.join(__dirname, 'assets', 'easyCRM.logo.png');

let transporter;
function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_PORT === 465, // 465 = SSL, 587 = STARTTLS
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return transporter
}

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

// Produce a tiny (~64px) PNG thumbnail for an item image, returned as a CID attachment.
// async function makeThumb(imageRel, cid) {
//   try {
//     if (!imageRel) return null;
//     const abs = path.join(ITEMS_DIR, imageRel.replace(/^\/+/, ''));
//     const buf = await sharp(abs).resize(64, 64, { fit: 'cover' }).png().toBuffer();
//     return { filename: `${cid}.png`, content: buf, cid };
//   } catch {
//     return null; // missing/broken image -> just skip the picture
//   }
// }

/**
 * Send a email to  employee with activation link
 */
export async function sendEmployeeActivationEmail(employee) {
//   const { link, logoTag, fullName } = await buildActivationContent(employee);
    const fullName = employee.first_name+" "+employee.last_name
    await fs.access(LOGO_PATH);
    const attachments = [{ filename: 'menuLogo.png', path: LOGO_PATH, cid: 'logo@easyCRM' }];
    const logoTag = `<img src="cid:logo@easyCRM" alt="easyCRM" style="height:64px;margin-bottom:8px"/>`;
    const link = process.env.DOMAIN+`/activate/${encodeURIComponent(employee.activation_token)}`;
  
  const html = `
  <div dir="ltr" style="font-family:Arial,Helvetica,sans-serif;max-width:640px;padding-inline-start:16px;color:#222;text-align:left">
    <div style="text-align:left">${logoTag}</div>
    <h2 style="text-align:left;margin:4px 0 8px">Welcome to easyCRM</h2>
    <p style="text-align:left;margin:0 0 16px">Hello ${esc(fullName)},</p>
    <p style="text-align:left;margin:0 0 16px">Your account activation link is <a href="${link}">here</a></p>
    <p style="color:#888;font-size:12px;margin-top:24px">Send automatically from easyCRM. No need to relpy to this email.</p>
  </div>`;

  return getTransporter().sendMail({
    from: config.smtp.from,
    to: employee.email,
    subject: 'Account activation — easyCRM',
    html,
    attachments,
  });
}

export async function verifyEmail() {
  return getTransporter().verify();
}
