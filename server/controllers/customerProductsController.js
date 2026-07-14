import customerProductsModel from "../models/customerProducts.model.js";

//controller get request from the route and call the model, and return response to the route.

// Get all customer products
async function getAllCustomerProducts (req, res){
  try {
    const { id } = req.params;
    const sortBy = req.query.sortBy;
    const sortDir = req.query.sortDir;
    const rows = await customerProductsModel.getAllCustomerProductsById(id,sortBy,sortDir);
    res.json(rows);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: error });
  }
};


// post new customer product
async function addCustomerProduct (req, res){
  try {
    const { customerId, productId} = req.body;

    const result = await customerProductsModel.addCustomerProductById(customerId,productId);
    

    let name = null, sku = null,description = null,price=null;
    if (productId) {
      const [rows] = await pool.execute(
        'SELECT description,sku,price,name FROM products WHERE id = ?',
        [productId]
      );
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
    getAllCustomerProducts,
    addCustomerProduct
}