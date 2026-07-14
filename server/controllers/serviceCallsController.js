import serviceCallsModel from "../models/serviceCalls.model.js";
import employeesModel from "../models/employees.model.js";

// controller gets the request from the route, calls the model, and returns the response.

// Get all service calls
async function getAllServiceCalls(req, res){
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const filter = JSON.parse(req.query.filter) ;
    const sortBy = req.query.sortBy;
    const sortDir = req.query.sortDir;

    const offset = (page - 1) * limit;
    const {total,items} = await serviceCallsModel.getAll(sortBy,sortDir,limit,offset,filter);
    const totalPages = Math.ceil(total/limit)
    res.json({items:items,pagination:{total:total,limit:limit,page:page,totalPages:totalPages}});
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: error });
  }
}

// Get one service call by id
async function getServicCall(req, res){
  try {
    const { id } = req.params;
    const [rows] = await serviceCallsModel.getById(id);
    //if user is a technician - allow fetching only if he is the call's technician
    const call = rows[0]??null;
    if (call && (req.user=="technician" && req.user.id!=call.assigned_technician_id)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    res.json(rows[0] ?? null);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: error });
  }
}


async function getCustomerCalls(req,res){
  try {
    const { customerId } = req.params;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const sortBy = req.query.sortBy;
    const sortDir = req.query.sortDir;
    const filter = req.query.filter ? JSON.parse(req.query.filter) : {};
    if (req.user.role=="technician"){
      filter.employee_id = req.user.id;
    }

    const {total,items} = await serviceCallsModel.getCustomerCalls(customerId,sortBy,sortDir,filter,limit,offset);
    if (req.user.role=="technician" && !total){
      return res.status(403).json({ message: "Forbidden" });
    }
    const totalPages = Math.ceil(total/limit)
    res.json({items:items,pagination:{total:total,limit:limit,page:page,totalPages:totalPages}});
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: error });
  }

}

// Create a new service call 
async function createServicCall(req, res){
  try {
    const result = await serviceCallsModel.createServiceCall(req.body)
    const [rows] = await serviceCallsModel.getById(result.insertId);
    const newServiceCall = {
      ...rows[0]
      // id: result.insertId,  
    };
    res.json(newServiceCall);
  } catch (error) {
    console.log('Database error:', error);
    res.status(500).json({ error: 'Failed to create service call' });
  }
}

// Update a service call
async function updateServicCall(req, res){
  try {
      const { id } = req.params;
      
      const updated = await serviceCallsModel.updateById(id,req.body);

      res.json({ id,  ...updated});
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ error: 'Failed to update service call' });
    }
}

// Delete a service call
async function deleteServicCall(req, res){
  try {
    const { id } = req.params;
    await serviceCallsModel.deleteById(id);
    res.json({ success: true });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to delete service call' });
  }
}

async function updateFinishByTechnicianServicCall(req,res){
  try {
    const { id } = req.params;
    await serviceCallsModel.updateFinishByTechnicianServicCall(id,req.user.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to finish by technician service call' });
  }
}
export default {
    getAllServiceCalls,
    getServicCall,
    getCustomerCalls,
    createServicCall,
    updateServicCall,
    deleteServicCall,
    updateFinishByTechnicianServicCall
};
