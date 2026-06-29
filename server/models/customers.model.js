import pool from "../db.js";

const BASE_SELECT = "SELECT id,name, first_name, last_name, phone, phone2, email, address,is_lead,priority,type,is_active FROM customers";
async function getAll(limit,offset){
    const [total] = await pool.execute('SELECT COUNT(*) AS total from customers');
    const [items] = await pool.execute(BASE_SELECT+ ' ORDER BY name ASC LIMIT '+limit +' OFFSET '+offset);
    return {total:total[0]["total"],items:items};
}

async function getById(id){
    return await pool.execute(BASE_SELECT+' where id=?',[id]);
}

async function getNameById(id){
    return await pool.execute('SELECT name FROM customers where id=?',[id]);
}

async function createCustomer(customer){
    const { name, first_name, last_name, phone, phone2, email, address ,is_lead,priority,type,is_active} = customer;
    const result = await pool.execute(
      'INSERT INTO customers (name, first_name, last_name, phone, phone2, email, address,is_lead,priority,type,is_active) VALUES (?, ?, ?, ?, ?, ?, ?,?, ?, ?,?)',
      [name, first_name, last_name, phone, phone2, email, address,is_lead,priority,type,is_active]
    );

     return [result];
}

async function updateById(id,customer){
    const { name, first_name, last_name, phone, phone2, email, address,is_lead,priority,type,is_active } = customer;
    console.log(priority);
    await pool.execute(
      'UPDATE customers SET name = ?, first_name = ?, last_name = ?, email = ?, phone = ?, phone2 = ?, address = ?,is_lead=?,priority=?,type=?,is_active=? WHERE id = ?',
      [name, first_name, last_name, phone, phone2, email, address,is_lead,priority,type,is_active,id]
    );
}
async function deleteById(id){
    await pool.execute('DELETE FROM customers WHERE id = ?', [id]);
}       


async function addCustomerProductById(id,pid){
    const result = await pool.execute(
      'INSERT INTO customer_products (customer_id, product_id) VALUES (?, ?)',
      [id, pid]
    );
    return [result];
}

async function getAllCustomerProductsById(id,limit,offset){
    const [total] = await pool.execute('SELECT COUNT(*) AS total FROM customer_products WHERE customer_id = ?', [id]);
    const [items] = await pool.execute('SELECT cs.id as customer_product_id ,p.id as product_id, '+
        'p.name as product_name, p.sku,p.description, p.price '+
        'FROM customers c '+
        'LEFT JOIN customer_products cs ON (c.id = cs.customer_id) '+
        'LEFT JOIN products p ON (cs.product_id = p.id) '+
        'WHERE c.id = ? ORDER BY p.name ASC LIMIT '+limit+' OFFSET '+offset,[id]);
    return {total:total[0]["total"],items:items};
}


export default {
  getAll,
  getById,
  getNameById,
  createCustomer,
  updateById,
  deleteById,
  getAllCustomerProductsById,
  addCustomerProductById
};