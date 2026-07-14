import pool from "../db.js";
import crypto from "node:crypto"
import bcrypt from "bcrypt"
import { buildOrderBy } from "../helpers/sort.js";
import { buildWhere } from "../helpers/filter.js";

import authModel from "./auth.model.js";
import { sendEmployeeActivationEmail } from "../email.js";

// employees: id, first_name, last_name, email, phone, role, is_active, created_at, updated_at
// role is a closed list: 'admin' | 'manager' | 'support' | 'technician' | 'sales'

const SELECT_BASE =
    'SELECT id, first_name, last_name, username,email, phone, role, is_active, created_at, updated_at,TIMESTAMP(activation_timeout) as activation_timeout FROM employees ';

// columns the client may sort by -> real SQL column (only these can reach ORDER BY)
const SORT_WHITELIST = {
    id: "id",
    first_name: "first_name",
    last_name: "last_name",
    email: "email",
    phone: "phone",
    role: "role",
    is_active: "is_active",
    created_at: "created_at",
    updated_at: "updated_at",
};
const DEFAULT_ORDER = "first_name ASC, last_name ASC";

// columns the client may filter by -> real SQL column + match type
const FILTER_WHITELIST = {
    first_name: { col: "first_name", match: "like" },
    last_name: { col: "last_name", match: "like" },
    email: { col: "email", match: "like" },
    username: { col: "username", match: "like" },
    phone: { col: "phone", match: "like" },
    role: { col: "role", match: "eq" },
    is_active: { col: "is_active", match: "eq" },
};

async function getAll(sortBy, sortDir, limit, offset, filter){
    const orderBy = buildOrderBy(sortBy, sortDir, SORT_WHITELIST, DEFAULT_ORDER);
    const { where, params } = buildWhere(filter, FILTER_WHITELIST);
    const [total] = await pool.execute('SELECT COUNT(*) AS total FROM employees '+where, params);
    const [items] = await pool.execute(SELECT_BASE+' '+where+orderBy+'  LIMIT '+limit +' OFFSET '+offset, params);
    return {total:total[0]["total"],items:items};
}

async function getById(id){
    return await pool.execute(SELECT_BASE+' WHERE id = ?', [id]);
}

async function getByEmail(email){
    return await pool.execute(SELECT_BASE+' WHERE email = ?', [email]);
}

async function getByUsername(username){
    return await pool.execute(SELECT_BASE+' WHERE username = ?', [username]);
}

function generateRandomString(length = 12) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";

  let password = "";

  for (let i = 0; i < length; i++) {
    password += chars[crypto.randomInt(0, chars.length)];
  }

  return password;
}




async function createEmployee(employee,conn){
    const { first_name, last_name, email, phone, role, is_active,username } = employee;
    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email.trim() && !EMAIL_RE.test(email.trim())) throw new Error("errEmail");

    const {token,timeout} = await authModel.createActivationToken();

    const [result] = await conn.execute(
      'INSERT INTO employees (first_name, last_name, email, phone, role, is_active,username,activation_token,activation_timeout ) VALUES (?, ?, ?, ?, ?, ?,?,?,?)',
      [first_name, last_name, email, phone, role, is_active ?? 1, username , token,timeout]
    );
    return result;
}

async function updateById(id, employee){
    const { first_name, last_name, email, phone, role, is_active,username,password  } = employee;
    // COALESCE keeps the existing password when the caller doesn't send one
    // (e.g. the Users form has no password field).
    await pool.execute(
      'UPDATE employees SET first_name = ?, last_name = ?, email = ?, phone = ?, role = ?, is_active = ?, password = COALESCE(?, password), updated_at = NOW() WHERE id = ?',
      [first_name, last_name, email, phone, role, is_active, password ?? null, id]
    );
}

// update only the contact fields (used when editing a technician/support agent),
// so role/is_active are not overwritten.
async function updateContactById(id, contact){
    const { first_name, last_name, email, phone } = contact;
    await pool.execute(
      'UPDATE employees SET first_name = ?, last_name = ?, email = ?, phone = ?, updated_at = NOW() WHERE id = ?',
      [first_name, last_name, email, phone, id]
    );
}

async function deleteById(id){
    await pool.execute('DELETE FROM employees WHERE id = ?', [id]);
}

export default {
  getAll,
  getById,
  getByEmail,
  getByUsername,
  createEmployee,
  updateById,
  updateContactById,
  deleteById,
};
