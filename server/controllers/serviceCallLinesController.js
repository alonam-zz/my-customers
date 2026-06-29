import serviceCallLinesModel from "../models/serviceCallLines.model.js";
import employeesModel from "../models/employees.model.js";

// controller gets the request from the route, calls the model, and returns the response.

// Get all service calls lines of call
async function getAllServiceCallsByCallId(req, res){
    console.log("GET /api/service calls called");
  try {
    const { call_id } = req.params;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const {total,items} = await serviceCallLinesModel.getByCallId(call_id,limit,offset);
    const totalPages = Math.ceil(total/limit)
    console.log(items);
    res.json({items:items,pagination:{total:total,limit:limit,page:page,totalPages:totalPages}});
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: error });
  }
}
// Create a new service call line
async function createServiceCallLine(req, res){
  try {
    const { call_id } = req.params;
    const result = await serviceCallLinesModel.createServiceCallLine(call_id,req.body)
    console.log(result);
    const [rows] = await serviceCallLinesModel.getById(result.insertId);
    const newServiceCallLine = {
      ...rows[0]
    };
    res.json(newServiceCallLine);
  } catch (error) {
    console.log('Database error:', error);
    res.status(500).json({ error: 'Failed to create service call line' });
  }
}

// Update a service call line
// async function updateServicCallLine(req, res){
//   try {
//       const { id } = req.params;
      
//       const updated = await serviceCallLinesModel.updateById(id,req.body);
//        console.log(updated);
//       res.json({ id,  ...updated}); 
//     } catch (error) {
//       console.error('Database error:', error);
//       res.status(500).json({ error: 'Failed to update service call' });
//     }
// }


export default {
    getAllServiceCallsByCallId,
    createServiceCallLine,
    // updateServicCallLine,

};
