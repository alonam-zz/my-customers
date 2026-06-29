import pool from "../db.js";
import crypto from "node:crypto"
import bcrypt from "bcrypt"

// employees: id, first_name, last_name, email, phone, role, is_active, created_at, updated_at
// role is a closed list: 'admin' | 'manager' | 'support' | 'technician' | 'sales'

const SELECT_BASE =
    'SELECT * FROM employees ';


async function getAll(limit,offset){
    const [total] = await pool.execute('SELECT COUNT(*) AS total FROM employees');
    const [items] = await pool.execute(SELECT_BASE+' ORDER BY first_name ASC, last_name ASC  LIMIT '+limit +' OFFSET '+offset);
    return {total:total[0]["total"],items:items};
}

async function getById(id){
    return await pool.execute(SELECT_BASE+' WHERE id = ?', [id]);
}

function generatePassword(length = 12) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";

  let password = "";

  for (let i = 0; i < length; i++) {
    password += chars[crypto.randomInt(0, chars.length)];
  }

  return password;
}

async function createEmployee(employee){
    const { first_name, last_name, email, phone, role, is_active,username } = employee;
    const plainPassword = generatePassword(10); console.log(plainPassword);
    const passwordHash = await bcrypt.hash(plainPassword, 10);

    const [result] = await pool.execute(
      'INSERT INTO employees (first_name, last_name, email, phone, role, is_active,username,password ) VALUES (?, ?, ?, ?, ?, ?,?,?)',
      [first_name, last_name, email, phone, role, is_active ?? 1, username , passwordHash]
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
  createEmployee,
  updateById,
  updateContactById,
  deleteById,
};
