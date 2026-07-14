import logsModel from "../models/logs.model.js";

// controller gets the request from the route, calls the model, and returns the response.

// Get all logs
async function getLogs(req, res){
  try {
    const filter = req.query.filter?JSON.parse(req.query.filter): [];
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const {total,items} = await logsModel.getLogs(filter,limit,offset); 
    const totalPages = Math.ceil(total/limit)
    res.json({items:items,pagination:{total:total,limit:limit,page:page,totalPages:totalPages}});
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: `Failed to get ${filter} report`});
  }
}


// Create a new customer
async function createLog (req, res){
  try {
    const result = await logsModel.createLog(req.body)
    const newLog = {
      id: result.insertId,
      ...req.body
    };
    res.json(newLog);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: `Failed to create log :${req.body}` });
  }
};


export default {
    getLogs,
    createLog

};
