import bcrypt from "bcrypt";
import pool from "../db.js";
import { generateToken } from "../models/serviceCalls.model.js";


async function updateTokens() {
  try {
    const [items] = await pool.execute("SELECT * FROM service_calls WHERE token=''");
    if (!items.length) return;
    for (const item of items){
        let id = item.id;
        let token = generateToken(16);
        await pool.execute("UPDATE service_calls SET token=? WHERE id=?",[token,id]);
    }


    console.log("Calls tokens updated successfully");
  } catch (error) {
    console.error("Failed to update token:", error);
  } finally {
    process.exit();
  }
}

updateTokens();