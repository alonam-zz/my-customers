import techniciansModel from "../models/technicians.model.js";
import employeesModel from "../models/employees.model.js";

// controller gets the request from the route, calls the model, and returns the response.

// Get all technicians
async function getAllTechnicians(req, res){
  try {
    const all = req.query.all;
    const page = Number(req.query.page) || 1;
    const limit = all ? Number.MAX_SAFE_INTEGER : Number(req.query.limit) || 20;
    const offset = all ? 0 : (page - 1) * limit;
    const sortBy = req.query.sortBy;
    const sortDir = req.query.sortDir;
    const filter = req.query.filter ? JSON.parse(req.query.filter) : {};
    const {total,items} = await techniciansModel.getAll(sortBy,sortDir,limit,offset,filter);
    const totalPages = Math.ceil(total/limit)
    res.json({items:items,pagination:{total:total,limit:limit,page:page,totalPages:totalPages}});
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: error });
  }
}

// Get one technician by id
async function getTechnician(req, res){
  try {
    const { id } = req.params;
    const [rows] = await techniciansModel.getById(id);
    res.json(rows[0] ?? null);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: error });
  }
}

// Get the logged-in user's own technician record (for the /my/details page)
async function getMyTechnician(req, res){
  try {
    const [rows] = await techniciansModel.getByEmployeeId(req.user.id);
    res.json(rows[0] ?? null);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: error });
  }
}

// Create a new technician — also creates the underlying employee (one call).
async function createTechnician(req, res){
  try {
    const { first_name, last_name, username,email, phone } = req.body;
    // 1) create the employee (role fixed to 'technician')
    const empResult = await employeesModel.createEmployee({
      first_name, last_name, email, phone, role: 'technician', is_active: 1,username
    });
    const employee_id = empResult.insertId;
    // 2) create the technician linked to that employee
    const result = await techniciansModel.createTechnician({ ...req.body, employee_id });
    // return the joined row (name/email/phone included)
    const [rows] = await techniciansModel.getById(result.insertId);
    res.json(rows[0] ?? { id: result.insertId, employee_id, ...req.body });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to create technician' });
  }
}

// Update a technician — also updates the linked employee's contact fields.
async function updateTechnician(req, res){
  try {
    const { id } = req.params;
    // technicians / support may only edit their OWN record — verify ownership
    // against the DB (never trust employee_id from the request body).
    if (req.user.role === "technician" || req.user.role === "support") {
      const [ownRows] = await techniciansModel.getById(id);
      const record = ownRows[0] ?? null;
      if (!record || Number(record.employee_id) !== Number(req.user.id)) {
        return res.status(403).json({ message: "Forbidden" });
      }
    }
    const { employee_id, first_name, last_name, email, phone } = req.body;
    if (employee_id) {
      await employeesModel.updateContactById(employee_id, { first_name, last_name, email, phone });
    }
    await techniciansModel.updateById(id, req.body);
    const [rows] = await techniciansModel.getById(id);
    res.json(rows[0] ?? { id, ...req.body });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to update technician' });
  }
}

// Delete a technician
async function deleteTechnician(req, res){
  try {
    const { id } = req.params;
    await techniciansModel.deleteById(id);
    res.json({ success: true });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to delete technician' });
  }
}

export default {
    getAllTechnicians,
    getTechnician,
    getMyTechnician,
    createTechnician,
    updateTechnician,
    deleteTechnician,
};
