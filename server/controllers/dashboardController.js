import dashboardModel from "../models/dashboard.model.js";


async function getState(req,res){    
  const state = req.query.state;
  try {
    const data = await dashboardModel.getState(state);
    setTimeout(()=>{res.json(data)},3000);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: `Failed to load state${state}` });
  }
};




export default {
    getState,
}