import pool from "../db.js";
import { buildOrderBy } from "../helpers/sort.js";
import { buildWhere } from "../helpers/filter.js";

const BASE_SELECT = "SELECT id,name, first_name, last_name, phone, phone2, email, address,region,is_lead,priority,type,is_active FROM customers";

// columns the client may filter by -> real SQL column + match type
const FILTER_WHITELIST = {
    name: { col: "name", match: "like" },
    first_name: { col: "first_name", match: "like" },
    last_name: { col: "last_name", match: "like" },
    phone: { col: "phone", match: "like" },
    email: { col: "email", match: "like" },
    priority: { col: "priority", match: "eq" },
    type: { col: "type", match: "eq" },
    is_active: { col: "is_active", match: "eq" },
};

// columns the client may sort by -> real SQL column (only these can reach ORDER BY)
const SORT_WHITELIST = {
    id: "id",
    name: "name",
    first_name: "first_name",
    last_name: "last_name",
    phone: "phone",
    phone2: "phone2",
    email: "email",
    address: "address",
    is_lead: "is_lead",
    priority: "priority",
    type: "type",
    is_active: "is_active",
};
const DEFAULT_ORDER = "name ASC";

async function getAll(sortBy,sortDir,limit,offset,filter){
    const orderBy = buildOrderBy(sortBy, sortDir, SORT_WHITELIST, DEFAULT_ORDER);
    const { where, params } = buildWhere(filter, FILTER_WHITELIST);
    const [total] = await pool.execute('SELECT COUNT(*) AS total from customers '+where, params);
    const [items] = await pool.execute(BASE_SELECT+ ' '+where+orderBy+' LIMIT '+limit +' OFFSET '+offset, params);
    return {total:total[0]["total"],items:items};
}

async function getById(id){
    return await pool.execute(BASE_SELECT+' where id=?',[id]);
}


async function getNameById(id){
    return await pool.execute('SELECT name FROM customers where id=?',[id]);
}

async function createCustomer(customer){
    const { name, first_name, last_name, phone, phone2, email, address ,region,is_lead,priority,type,is_active} = customer;
    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email.trim() && !EMAIL_RE.test(email.trim())) throw new Error("errEmail");
    const result = await pool.execute(
      'INSERT INTO customers (name, first_name, last_name, phone, phone2, email, address,region,is_lead,priority,type,is_active) VALUES (?, ?, ?, ?, ?, ?, ?,?,?, ?, ?,?)',
      [name, first_name, last_name, phone, phone2, email, address,region,is_lead,priority,type,is_active]
    );

     return [result];
}

async function updateById(id,customer){
    const { name, first_name, last_name, phone, phone2, email, address,region,is_lead,priority,type,is_active } = customer;
    // Basic email shape check (only enforced when an email is actually provided).
    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email.trim() && !EMAIL_RE.test(email.trim())) throw new Error("errEmail");

    await pool.execute(
      'UPDATE customers SET name = ?, first_name = ?, last_name = ?, phone = ?, phone2 = ?, email = ?, address = ?,region=?,is_lead=?,priority=?,type=?,is_active=? WHERE id = ?',
      [name, first_name, last_name, phone, phone2, email, address,region,is_lead,priority,type,is_active,id]
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

// columns the client may sort by for a customer's products
const CUSTOMER_PRODUCTS_SORT_WHITELIST = {
    product_id: "p.id",
    product_name: "p.name",
    sku: "p.sku",
    price: "p.price",
};
const CUSTOMER_PRODUCTS_DEFAULT_ORDER = "p.name ASC";

async function getAllCustomerProductsById(id,sortBy,sortDir,limit,offset){
    const orderBy = buildOrderBy(sortBy, sortDir, CUSTOMER_PRODUCTS_SORT_WHITELIST, CUSTOMER_PRODUCTS_DEFAULT_ORDER);
    const [total] = await pool.execute('SELECT COUNT(*) AS total FROM customer_products WHERE customer_id = ?', [id]);
    const [items] = await pool.execute('SELECT cs.id as customer_product_id ,p.id as product_id, '+
        'p.name as product_name, p.sku,p.description, p.price '+
        'FROM customers c '+
        'LEFT JOIN customer_products cs ON (c.id = cs.customer_id) '+
        'LEFT JOIN products p ON (cs.product_id = p.id) '+
        'WHERE c.id = ? '+orderBy+' LIMIT '+limit+' OFFSET '+offset,[id]);
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