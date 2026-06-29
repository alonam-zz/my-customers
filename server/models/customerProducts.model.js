import pool from "../db.js";
               
async function getAllCustomerProductsById(id){
    const [rows] = await pool.execute('SELECT cs.id as customer_product_id ,p.id as product_id, '+
        'p.name as product_name, p.sku,p.description, p.price '+ 
        'FROM customers c '+
        'LEFT JOIN customer_products cs ON (c.id = cs.customer_id) '+
        'LEFT JOIN products p ON (cs.product_id = p.id) '+
        'WHERE c.id = ? ORDER BY p.name ASC',[id]);
    return rows;
}


async function addCustomerProductById(id,pid){
    const result = await pool.execute(
      'INSERT INTO customer_products (customer_id, product_id) VALUES (?, ?)',
      [id, pid]
    );
    return [result];
}


export default {
  getAllCustomerProductsById,
  addCustomerProductById
};