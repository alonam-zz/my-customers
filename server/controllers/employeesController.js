import employeesModel from "../models/employees.model.js";

// controller gets the request from the route, calls the model, and returns the response.

// role is a closed list — validate before writing
const ALLOWED_ROLES = ['admin', 'manager', 'support', 'technician', 'sales'];

function invalidRole(role){
  return role !== undefined && role !== null && !ALLOWED_ROLES.includes(role);
}

// Get all employees
async function getAllEmployees(req, res){
    console.log("GET /api/employees called");
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const {total,items} = await employeesModel.getAll(limit,offset);
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
  try {
    if (invalidRole(req.body.role)) {
      return res.status(400).json({ error: `Invalid role. Allowed: ${ALLOWED_ROLES.join(', ')}` });
    }
    const result = await employeesModel.createEmployee(req.body);
    res.json({ id: result.insertId, ...req.body });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to create employee' });
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
