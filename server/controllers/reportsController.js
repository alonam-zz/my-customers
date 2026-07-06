import reportsModel from "../models/reports.model.js";

// controller gets the request from the route, calls the model, and returns the response.

// Get all service calls
async function getReportById(req, res){
    console.log("GET /api/service reports called");
  try {
    const { id } = req.params;
    const filter = req.query.filter?JSON.parse(req.query.filter): []; console.log("---",filter);
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const {items} = await reportsModel.getShortReportById(id,filter,limit,offset);

    res.json({items:items});
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: `Failed to get ${id} report`});
  }
}


export default {
    getReportById,

};
