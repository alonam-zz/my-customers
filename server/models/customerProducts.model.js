import pool from "../db.js";
import { buildOrderBy } from "../helpers/sort.js";

// columns the client may sort by -> real SQL column (only these can reach ORDER BY)
const SORT_WHITELIST = {
    product_id: "p.id",
    product_name: "p.name",
    sku: "p.sku",
    price: "p.price",
};
const DEFAULT_ORDER = "p.name ASC";

async function getAllCustomerProductsById(id,sortBy,sortDir){
    const orderBy = buildOrderBy(sortBy, sortDir, SORT_WHITELIST, DEFAULT_ORDER);
    const [rows] = await pool.execute('SELECT cs.id as customer_product_id ,p.id as product_id, '+
        'p.name as product_name, p.sku,p.description, p.price '+
        'FROM customers c '+
        'LEFT JOIN customer_products cs ON (c.id = cs.customer_id) '+
        'LEFT JOIN products p ON (cs.product_id = p.id) '+
        'WHERE c.id = ? '+orderBy,[id]);
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