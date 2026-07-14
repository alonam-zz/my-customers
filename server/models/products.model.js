import pool from "../db.js";
import { buildOrderBy } from "../helpers/sort.js";
import { buildWhere } from "../helpers/filter.js";

const SELECT_BASE =
    'SELECT * FROM products ';

// columns the client may sort by -> real SQL column (only these can reach ORDER BY)
const SORT_WHITELIST = {
    id: "id",
    name: "name",
    sku: "sku",
    price: "price",
    created_at: "created_at",
    updated_at: "updated_at",
};
const DEFAULT_ORDER = "name ASC";

// columns the client may filter by -> real SQL column + match type
const FILTER_WHITELIST = {
    name: { col: "name", match: "like" },
    sku: { col: "sku", match: "like" },
    description: { col: "description", match: "like" },
    price: { col: "price", match: "like" },
};

async function getAll(sortBy, sortDir, limit, offset, filter){
    const orderBy = buildOrderBy(sortBy, sortDir, SORT_WHITELIST, DEFAULT_ORDER);
    const { where, params } = buildWhere(filter, FILTER_WHITELIST);
    const [total] = await pool.execute('SELECT COUNT(*) AS total FROM products '+where, params);
    const [items] = await pool.execute(SELECT_BASE + where + orderBy + '  LIMIT '+limit +' OFFSET '+offset, params);
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
      'UPDATE products SET name = ?, sku = ?, description = ?, price = ?,updated_at=NOW() WHERE id = ?',
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