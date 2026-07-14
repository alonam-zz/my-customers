import servicesModel from "../models/services.model.js";

// controller gets the request from the route, calls the model, and returns the response.

// Get all services
async function getAllServices(req, res){
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const sortBy = req.query.sortBy;
    const sortDir = req.query.sortDir;
    const filter = req.query.filter ? JSON.parse(req.query.filter) : {};
    const {total,items} = await servicesModel.getAll(sortBy,sortDir,limit,offset,filter);
    const totalPages = Math.ceil(total/limit)
    res.json({items:items,pagination:{total:total,limit:limit,page:page,totalPages:totalPages}});
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: error });
  }
}

// Get one service by id
async function getService(req, res){
  try {
    const { id } = req.params;
    const [rows] = await servicesModel.getById(id);
    res.json(rows[0] ?? null);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: error });
  }
}

// Create a new service
async function createService(req, res){
  try {
    const result = await servicesModel.createService(req.body);
    // re-read the joined row so the response includes product_name
    const [rows] = await servicesModel.getById(result.insertId);
    res.json(rows[0] ?? { id: result.insertId, ...req.body });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to create service' });
  }
}

// Update a service
async function updateService(req, res){
  try {
    const { id } = req.params;
    await servicesModel.updateById(id, req.body);
    res.json({ id, ...req.body });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to update service' });
  }
}

// Delete a service
async function deleteService(req, res){
  try {
    const { id } = req.params;
    await servicesModel.deleteById(id);
    res.json({ success: true });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to delete service' });
  }
}

export default {
    getAllServices,
    getService,
    createService,
    updateService,
    deleteService,
};
