import pool from "../db.js";
import bcrypt from "bcrypt";
import crypto from "node:crypto";

// how long a password-reset / activation link stays valid
const ACTIVATION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes


async  function createActivationToken(){
  const token =  crypto.randomBytes(24).toString("hex"); // opaque, URL-safe
  const timeout = new Date(Date.now() + ACTIVATION_TIMEOUT_MS);
  return {
    token:token,
    timeout:timeout
  }
}
// Issue a fresh activation token for the (active) employee with this email and
// store it with a 30-minute expiry. Returns the employee row (with the new
// token) so the caller can email the link, or null if no such active employee.
async function updateActivationToken(email){
  const [rows] = await pool.execute(
    'SELECT * FROM employees WHERE email=? AND is_active="1"', [email.trim()]
  );
  const employee = rows[0] ?? null;
  if (!employee?.id) return null;

  const {token,timeout} = await createActivationToken();
  
  await pool.execute(
    'UPDATE employees SET activation_token=?, activation_timeout=? WHERE id=?',
    [token, timeout, employee.id]
  );
  employee.activation_token = token;
  employee.activation_timeout = timeout;
  return employee;
}

async function findByUsername(username){
    const [result] = await pool.execute(
      'SELECT * FROM employees WHERE username=?',[username]
    );
    return result;
}

async function findByActivationValidation(token){ 
  const [result] = await pool.execute(
      'SELECT * FROM employees WHERE activation_token=? AND TIMESTAMP(activation_timeout)>=NOW() AND is_active="1"',[token]
    ); 
    return result;
}

async function login(id){
  await pool.execute('UPDATE employees SET last_login_at=NOW() WHERE id=?',[id]);
}

async function logout(){
    // const {username,password} = login_params;
    // const passwordHash = await bcrypt.hash(password, 10);
    // const [result] = await pool.execute(
    //   'SELECT * FROM employees WHERE username=?,password=?',[username, passwordHash]
    // );
    // return result;
}

async function me(){
    // const {username} = login_params;
    
    // const [result] = await pool.execute(
    //   'SELECT * FROM employees WHERE username=?',[username]
    // );
    // return result;
}

async function setPassword(user_id,password){
  const passwordHash = await bcrypt.hash(password, 10);
  await pool.execute('UPDATE employees SET password=?,activation_token=NULL,activation_timeout=NULL WHERE id=?',[passwordHash,user_id]);
}

export default {
  findByUsername,
  login,
  logout,
  me,
  setPassword,
  findByActivationValidation,
  updateActivationToken,
  createActivationToken
};
