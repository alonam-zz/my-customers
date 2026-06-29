import pool from "../db.js";

// services: id, name, product_id, description, price, created_at, updated_at
// joined with products to expose product_name (the client only sends product_id).

const SELECT_BASE =
    'SELECT s.id, s.name, s.product_id, s.description, s.price, s.created_at, s.updated_at, p.name AS product_name ' +
    'FROM services s LEFT JOIN products p ON (s.product_id = p.id) ';

async function getAll(limit,offset){
    const [total] = await pool.execute('SELECT COUNT(*) AS total FROM services');
    const [items] = await pool.execute(SELECT_BASE + 'ORDER BY p.name ASC, s.name ASC  LIMIT '+limit +' OFFSET '+offset);
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
