import employeesModel from "../models/employees.model.js";
import supportAgentsModel from "../models/supportAgents.model.js";
import techniciansModel from "../models/technicians.model.js"

import pool from "../db.js";

import { sendEmployeeActivationEmail } from "../email.js";

// controller gets the request from the route, calls the model, and returns the response.

// role is a closed list — validate before writing
const ALLOWED_ROLES = ['admin', 'manager', 'support', 'technician', 'sales'];

function invalidRole(role){
  return role !== undefined && role !== null && !ALLOWED_ROLES.includes(role);
}

// Get all employees
async function getAllEmployees(req, res){
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const sortBy = req.query.sortBy;
    const sortDir = req.query.sortDir;
    const filter = req.query.filter ? JSON.parse(req.query.filter) : {};
    const {total,items} = await employeesModel.getAll(sortBy,sortDir,limit,offset,filter);
    const totalPages = Math.ceil(total/limit)
    res.json({items:items,pagination:{total:total,limit:limit,page:page,totalPages:totalPages}});
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: error });
  }
}

// Get one employee by id
async function getEmployee(req, res){
  try {
    const { id } = req.params;
    const [rows] = await employeesModel.getById(id);
    res.json(rows[0] ?? null);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: error });
  }
}

// Create a new employee
async function createEmployee(req, res){
  const conn = await pool.getConnection();
  try {
    if (invalidRole(req.body.role)) {
      return res.status(400).json({ error: `Invalid role. Allowed: ${ALLOWED_ROLES.join(', ')}` });
    }
    const email = req.body?.email;
    const [emailRow] = await employeesModel.getByEmail(email);
    if (emailRow.length) {
      return res.status(400).json({ error: `Invalid email. Email already exists for another employee` });
    }

    const username = req.body?.username;
    const [usernameRow] = await employeesModel.getByUsername(username);
    if (usernameRow.length) {
      return res.status(400).json({ error: `Invalid username. USername already exists for another employee` });
    }
    
    await conn.beginTransaction();

    const result = await employeesModel.createEmployee(req.body,conn);
    if (req.body.role!="technician"){
      const agent = {  level:'L1', specialization:'', availability_status:'available', max_open_calls :'20',...req.body,employee_id:result['insertId'],};

      await supportAgentsModel.createSupportAgent(agent,conn)
    }
    else {
      const tech =  {region:"", specialization:"", availability_status:'available',max_daily_visits:'6', is_external:0, vehicle_number:'', notes:'',...req.body,employee_id:result['insertId'],}; 
      await techniciansModel.createTechnician(tech,conn);
    }
   
    await conn.commit();

     const [rows] = await employeesModel.getById(result.insertId);
     const employee = rows[0] ?? null;
    await sendEmployeeActivationEmail(employee); // should put email in an email queue - in the future

    res.json({ employee });
  } catch (error) {
    try {
      await conn.rollback();
    } catch (rollbackError) {
      console.error('Rollback failed:', rollbackError);
    }
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to create employee' });

  } finally {
    conn.release();
  }
}


// Update an employee
async function updateEmployee(req, res){
  try {
    const { id } = req.params;
    if (invalidRole(req.body.role)) {
      return res.status(400).json({ error: `Invalid role. Allowed: ${ALLOWED_ROLES.join(', ')}` });
    }
    await employeesModel.updateById(id, req.body);
    res.json({ id, ...req.body });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to update employee' });
  }
}

// Delete an employee
async function deleteEmployee(req, res){
  try {
    const { id } = req.params;
    await employeesModel.deleteById(id);
    res.json({ success: true });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to delete employee' });
  }
}

export default {
    getAllEmployees,
    getEmployee, 
    createEmployee,
    updateEmployee,
    deleteEmployee,
};
