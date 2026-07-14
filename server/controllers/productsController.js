import productsModel from "../models/products.model.js";

//controller get request from the route and call the model, and return response to the route.

// Get all customers

async function getAllProducts(req,res){
  try {
    const all = req.query.all;
    const page = Number(req.query.page) || 1;
    const limit = all ? Number.MAX_SAFE_INTEGER : Number(req.query.limit) || 20;
    const offset = all ? 0 : (page - 1) * limit;
    const sortBy = req.query.sortBy;
    const sortDir = req.query.sortDir;
    const filter = req.query.filter ? JSON.parse(req.query.filter) : {};
    const {total,items} = await productsModel.getAll(sortBy,sortDir,limit,offset,filter);
    const totalPages = Math.ceil(total/limit)
    res.json({items:items,pagination:{total:total,limit:limit,page:page,totalPages:totalPages}});
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: error });
  }
};

// Create a new product
async function createProduct (req, res){
  try {
    const { name, description, sku, price} = req.body;
    const result = await productsModel.createProduct(req.body); 
    
    const newProduct = {
      id: result.insertId,
      name,
      sku,
      description,
      price
    };
    res.json(newProduct);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
}


// Update a product
async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    const { name, sku,description,price } = req.body;
    await productsModel.updateById(id,req.body)
    
    res.json({ id, ...req.body });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
};


// Delete a product
async function deleteProduct(req, res) {
  try {
    const { id } = req.params;
    await productsModel.deleteProduct(id)
    
    res.json({ success: true });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
};

async function getProductServices(req,res){
  try{
    const {id} = req.params;
    const [rows] = await productsModel.getProductServices(id);
    res.json(rows);
  }
  catch(error){
    console.log(error);
    res.status(500).json({error:'Failt to get product services'});
  }
}



export default {
    getAllProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductServices
}