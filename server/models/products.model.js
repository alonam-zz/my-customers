import pool from "../db.js";

const SELECT_BASE =
    'SELECT * FROM products ';


async function getAll(limit,offset){
    const [total] = await pool.execute('SELECT COUNT(*) AS total FROM products');
    const [items] = await pool.execute(SELECT_BASE +'ORDER BY name ASC  LIMIT '+limit +' OFFSET '+offset);
    return {total:total[0]["total"],items:items};
}

async function getById(id){
    return await pool.execute(SELECT_BASE+' WHERE ID=?',[id]);
}

async function createProduct(product){
    const { name, description, sku, price} = product;
    const [result] = await pool.execute(
      'INSERT INTO products (name, description, sku, price) VALUES (?, ?, ?, ?)',
      [name, description, sku, price]
    );
    return result;
}
async function updateById(id,product){
    const { name, sku,description,price } = product;
    await pool.execute(
      'UPDATE products SET name = ?, sku = ?, description = ?, price = ? WHERE id = ?',
      [name, sku, description, price, id]
    );
}

async function deleteById(id){
    await pool.execute('DELETE FROM products WHERE id = ?', [id]);
}

async function getProductServices(id){
     return await pool.execute( 'SELECT * FROM services WHERE product_id=? ORDER BY name ASC',[id]);        
}

export default {
  getAll,
  getById,
  createProduct,
  updateById,
  deleteById,
  getProductServices
};