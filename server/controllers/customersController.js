import customerModel from "../models/customers.model.js";
import productsModel from "../models/products.model.js";

//controller get request from the route and call the model, and return response to the route.

// Get all customers

async function getAllCustomers(req,res){         
    console.log("GET /api/customers called");
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const {total,items} = await customerModel.getAll(limit,offset);
    const totalPages = Math.ceil(total/limit)
    res.json({items:items,pagination:{total:total,limit:limit,page:page,totalPages:totalPages}});
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: error });
  }
};

// Get  customer by id
async function getCustomer(req, res){
    console.log("GET /api/customers/id called");
  try {
    const { id } = req.params;
    const [rows] = await customerModel.getById(id);
    res.json(rows);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: error });
  }
};

// Get  customer name by id
async function getCustomerName(req, res){
    console.log("GET /api/customers/id called");
  try {
    const { id } = req.params;
    const [rows] = await customerModel.getNameById(id);
    res.json(rows);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: error });
  }
};

// Create a new customer
async function createCustomer (req, res){
  try {
    const result = await customerModel.createCustomer(req.body)
    const newCustomer = {
      id: result.insertId,
      ...req.body
    };
    res.json(newCustomer);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to create customer' });
  }
};


// Update a customer
async function updateCustomer(req, res){
  try {
    const { id } = req.params;
    console.log(req.body);
    await customerModel.updateById(id,req.body)
    res.json({ id, ...req.body });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to update customer' });
  }
};

// Delete a customer
async function deleteCustomer(req, res){
  try {
    const { id } = req.params;
    await customerModel.deleteById();
    res.json({ success: true });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to delete customer' });
  }
};


// Get all customer products
async function getAllCustomerProducts (req, res){
    console.log("GET /api/customer products called");
  try {
    const { id } = req.params;
    const all = req.query.all;
    const page = Number(req.query.page) || 1;
    const limit = all ? Number.MAX_SAFE_INTEGER : Number(req.query.limit) || 20;
    const offset = all ? 0 : (page - 1) * limit;
    const {total,items} = await customerModel.getAllCustomerProductsById(id,limit,offset);
    const totalPages = Math.ceil(total/limit)
    res.json({items:items,pagination:{total:total,limit:limit,page:page,totalPages:totalPages}});
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: error });
  }
};


// post new customer product
async function addCustomerProduct (req, res){
    console.log("POST /api/customer add product");
  try {
    const { id } = req.params;  
    const { productId} = req.body;

    const result = await customerModel.addCustomerProductById(id,productId);
    

    let name = null, sku = null,description = null,price=null;
    if (productId) {
      const rows = await productsModel.getById(productId);

      name = rows[0]?.name ?? null;
      description = rows[0]?.description ?? null;
      sku = rows[0]?.sku ?? null;
    }

    const newCustomerProduct = {
      id: result.insertId,
      name:name,
      sku:sku,
      description:description,
      price:price
    };
    res.json(newCustomerProduct);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: error });
  }
};


export default {
    getCustomer,
    getCustomerName,
    getAllCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    getAllCustomerProducts,
    addCustomerProduct
}