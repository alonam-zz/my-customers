import bcrypt from "bcrypt";
import pool from "../db.js";
import employeesModel from "../models/employees.model.js";

async function seedAdmin() {
  try {
    const firstName = "Admin";
    const lastName = "User";
    const email = "admin@example.com";
    const username = "admin";
    const plainPassword = "Admin123456!";
    const role = "admin";
    const phone = "";

    const passwordHash = await bcrypt.hash(plainPassword, 10);
    await employeesModel.createEmployee({
        first_name:firstName,
        last_name:lastName,
        email,
        phone:phone,
        username,
        password:passwordHash,
        role:role,
        is_active:1
    });

    console.log("Admin user created successfully");
  } catch (error) {
    console.error("Failed to create admin user:", error);
  } finally {
    process.exit();
  }
}

seedAdmin();