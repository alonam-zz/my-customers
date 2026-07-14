import pool from "../db.js";
import { buildOrderBy } from "../helpers/sort.js";
import { buildWhere } from "../helpers/filter.js";

// services: id, name, product_id, description, price, created_at, updated_at
// joined with products to expose product_name (the client only sends product_id).

const FROM_BASE = 'FROM services s LEFT JOIN products p ON (s.product_id = p.id) ';
const SELECT_BASE =
    'SELECT s.id, s.name, s.product_id, s.description, s.price, s.created_at, s.updated_at, p.name AS product_name ' +
    FROM_BASE;

// columns the client may filter by -> real SQL column + match type
const FILTER_WHITELIST = {
    name: { col: "s.name", match: "like" },
    description: { col: "s.description", match: "like" },
    product_name: { col: "p.name", match: "like" },
};

// columns the client may sort by -> real SQL column (only these can reach ORDER BY)
const SORT_WHITELIST = {
    id: "s.id",
    name: "s.name",
    price: "s.price",
    created_at: "s.created_at",
    updated_at: "s.updated_at",
    product_name: "p.name",
};
const DEFAULT_ORDER = "p.name ASC, s.name ASC";

async function getAll(sortBy, sortDir, limit, offset, filter){
    const orderBy = buildOrderBy(sortBy, sortDir, SORT_WHITELIST, DEFAULT_ORDER);
    const { where, params } = buildWhere(filter, FILTER_WHITELIST);
    const [total] = await pool.execute('SELECT COUNT(*) AS total '+FROM_BASE+where, params);
    const [items] = await pool.execute(SELECT_BASE + where + orderBy + '  LIMIT '+limit +' OFFSET '+offset, params);
    return {total:total[0]["total"],items:items};
}

async function getById(id){
    return await pool.execute(SELECT_BASE + 'WHERE s.id = ?', [id]);
}

async function createService(service){
    const { name, description, price, product_id } = service;
    const [result] = await pool.execute(
      'INSERT INTO services (name, description, price, product_id) VALUES (?, ?, ?, ?)',
      [name, description, price, product_id]
    );
    return result;
}

async function updateById(id, service){
    const { name, description, price, product_id } = service;
    await pool.execute(
      'UPDATE services SET name = ?, description = ?, price = ?, product_id = ?, updated_at = NOW() WHERE id = ?',
      [name, description, price, product_id, id]
    );
}

async function deleteById(id){
    await pool.execute('DELETE FROM services WHERE id = ?', [id]);
}

export default {
  getAll,
  getById,
  createService,
  updateById,
  deleteById,
};
