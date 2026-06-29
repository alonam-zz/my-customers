import pool from "../db.js";

// technicians: id, employee_id, region, specialization, availability_status,
//              max_daily_visits, is_external, vehicle_number, notes
// joined with employees to expose the technician's name/email.

const SELECT_BASE =
    'SELECT t.*, e.first_name, e.last_name, e.email, e.phone ' +
    'FROM technicians t LEFT JOIN employees e ON (t.employee_id = e.id) ';

async function getAll(limit,offset){
    const [total] = await pool.execute('SELECT COUNT(*) AS total FROM technicians');
    const [items] = await pool.execute(SELECT_BASE + 'ORDER BY e.first_name ASC, e.last_name ASC  LIMIT '+limit +' OFFSET '+offset);
    return {total:total[0]["total"],items:items};
}

async function getById(id){
    return await pool.execute(SELECT_BASE + 'WHERE t.id = ?', [id]);
}

async function createTechnician(tech){
    const {
      employee_id, region, specialization, availability_status,
      max_daily_visits, is_external, vehicle_number, notes,
    } = tech;
    const [result] = await pool.execute(
      'INSERT INTO technicians (employee_id, region, specialization, availability_status, max_daily_visits, is_external, vehicle_number, notes) ' +
      'VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [employee_id, region, specialization, availability_status, max_daily_visits, is_external, vehicle_number, notes]
    );
    return result;
}

async function updateById(id, tech){
    const {
      employee_id, region, specialization, availability_status,
      max_daily_visits, is_external, vehicle_number, notes,
    } = tech;
    await pool.execute(
      'UPDATE technicians SET employee_id = ?, region = ?, specialization = ?, availability_status = ?, max_daily_visits = ?, is_external = ?, vehicle_number = ?, notes = ? WHERE id = ?',
      [employee_id, region, specialization, availability_status, max_daily_visits, is_external, vehicle_number, notes, id]
    );
}

async function deleteById(id){
    await pool.execute('DELETE FROM technicians WHERE id = ?', [id]);
}

export default {
  getAll,
  getById,
  createTechnician,
  updateById,
  deleteById,
};
