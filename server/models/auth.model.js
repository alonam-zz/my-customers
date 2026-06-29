import pool from "../db.js";
import bcrypt from "bcrypt";


async function findByUsername(username){
    const [result] = await pool.execute(
      'SELECT * FROM employees WHERE username=?',[username]
    );
    return result;
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

export default {
  findByUsername,
  logout,
  me,
};
