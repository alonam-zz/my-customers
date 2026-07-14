import areasModel from "../models/areas.model.js";

// Get active areas grouped for the <Select> component.
async function getAreas(req, res){
  try {
    const items = await areasModel.getGroupedAreas();
    res.json({ items });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to get areas' });
  }
}

export default {
  getAreas,
};
