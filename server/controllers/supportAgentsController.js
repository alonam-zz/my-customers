import supportAgentsModel from "../models/supportAgents.model.js";
import employeesModel from "../models/employees.model.js";

// controller gets the request from the route, calls the model, and returns the response.

// level is a closed list — validate before writing
const ALLOWED_LEVELS = ['L1', 'L2', 'L3'];

function invalidLevel(level){
  return level !== undefined && level !== null && !ALLOWED_LEVELS.includes(level);
}

// Get all support agents
async function getAllSupportAgents(req, res){
    console.log("GET /api/supportAgents called");
  try {
    const all = req.query.all;
    const page = Number(req.query.page) || 1;
    const limit = all ? Number.MAX_SAFE_INTEGER : Number(req.query.limit) || 20;
    const offset = all ? 0 : (page - 1) * limit;
    const {total,items} = await supportAgentsModel.getAll(limit,offset);
    const totalPages = Math.ceil(total/limit)
    res.json({items:items,pagination:{total:total,limit:limit,page:page,totalPages:totalPages}});
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: error });
  }
}

// Get one support agent by id
async function getSupportAgent(req, res){
  try {
    const { id } = req.params;
    const [rows] = await supportAgentsModel.getById(id);
    res.json(rows[0] ?? null);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: error });
  }
}

// Create a new support agent — also creates the underlying employee (one call).
async function createSupportAgent(req, res){
  try {
    if (invalidLevel(req.body.level)) {
      return res.status(400).json({ error: `Invalid level. Allowed: ${ALLOWED_LEVELS.join(', ')}` });
    }
    const { first_name, last_name, email, phone } = req.body;
    // 1) create the employee (role fixed to 'support')
    const empResult = await employeesModel.createEmployee({
      first_name, last_name, email, phone, role: 'support', is_active: 1,
    });
    const employee_id = empResult.insertId;
    // 2) create the support agent linked to that employee
    const result = await supportAgentsModel.createSupportAgent({ ...req.body, employee_id });
    const [rows] = await supportAgentsModel.getById(result.insertId);
    res.json(rows[0] ?? { id: result.insertId, employee_id, ...req.body });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to create support agent' });
  }
}

// Update a support agent — also updates the linked employee's contact fields.
async function updateSupportAgent(req, res){
  try {
    const { id } = req.params;
    if (invalidLevel(req.body.level)) {
      return res.status(400).json({ error: `Invalid level. Allowed: ${ALLOWED_LEVELS.join(', ')}` });
    }
    const { employee_id, first_name, last_name, email, phone } = req.body;
    if (employee_id) {
      await employeesModel.updateContactById(employee_id, { first_name, last_name, email, phone });
    }
    await supportAgentsModel.updateById(id, req.body);
    const [rows] = await supportAgentsModel.getById(id);
    res.json(rows[0] ?? { id, ...req.body });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to update support agent' });
  }
}

// Delete a support agent
async function deleteSupportAgent(req, res){
  try {
    const { id } = req.params;
    await supportAgentsModel.deleteById(id);
    res.json({ success: true });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to delete support agent' });
  }
}

export default {
    getAllSupportAgents,
    getSupportAgent,
    createSupportAgent,
    updateSupportAgent,
    deleteSupportAgent,
};
