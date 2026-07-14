import pool from "../db.js";
import { buildOrderBy } from "../helpers/sort.js";
import { buildWhere } from "../helpers/filter.js";

// technicians: id, employee_id, region, specialization, availability_status,
//              max_daily_visits, is_external, vehicle_number, notes
// joined with employees to expose the technician's name/email.

const FROM_BASE = 'FROM technicians t LEFT JOIN employees e ON (t.employee_id = e.id) ';
const SELECT_BASE =
    'SELECT t.*, e.first_name, e.last_name, e.email, e.phone,e.username ' +
    FROM_BASE;

// columns the client may filter by -> real SQL column + match type
const FILTER_WHITELIST = {
    name: { col: "CONCAT_WS(' ', e.first_name, e.last_name)", match: "like" },
    first_name: { col: "e.first_name", match: "like" },
    last_name: { col: "e.last_name", match: "like" },
    email: { col: "e.email", match: "like" },
    phone: { col: "e.phone", match: "like" },
    region: { col: "t.region", match: "like" },
    specialization: { col: "t.specialization", match: "like" },
    availability_status: { col: "t.availability_status", match: "eq" },
    is_external: { col: "t.is_external", match: "eq" },
};

// columns the client may sort by -> real SQL column (only these can reach ORDER BY)
const SORT_WHITELIST = {
    id: "t.id",
    region: "t.region",
    specialization: "t.specialization",
    availability_status: "t.availability_status",
    max_daily_visits: "t.max_daily_visits",
    is_external: "t.is_external",
    vehicle_number: "t.vehicle_number",
    first_name: "e.first_name",
    last_name: "e.last_name",
    email: "e.email",
    phone: "e.phone",
    username: "e.username",
};
const DEFAULT_ORDER = "e.first_name ASC, e.last_name ASC";

async function getAll(sortBy, sortDir, limit, offset, filter){
    const orderBy = buildOrderBy(sortBy, sortDir, SORT_WHITELIST, DEFAULT_ORDER);
    const { where, params } = buildWhere(filter, FILTER_WHITELIST);
    const [total] = await pool.execute('SELECT COUNT(*) AS total '+FROM_BASE+where, params);
    const [items] = await pool.execute(SELECT_BASE + where + orderBy + '  LIMIT '+limit +' OFFSET '+offset, params);
    return {total:total[0]["total"],items:items};
}

async function getById(id){
    return await pool.execute(SELECT_BASE + 'WHERE t.id = ?', [id]);
}

async function getByEmployeeId(employee_id){
    return await pool.execute(SELECT_BASE + 'WHERE t.employee_id = ?', [employee_id]);
}

async function createTechnician(tech,conn){
    const db = conn || pool;
    const {
      employee_id, region, specialization, availability_status,
      max_daily_visits, is_external, vehicle_number, notes,
    } = tech;
    const [result] = await db.execute(
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
  getByEmployeeId,
  createTechnician,
  updateById,
  deleteById,
};
