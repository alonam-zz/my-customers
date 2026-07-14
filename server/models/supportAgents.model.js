import pool from "../db.js";
import { buildOrderBy } from "../helpers/sort.js";
import { buildWhere } from "../helpers/filter.js";

// support_agents: id, employee_id, level, specialization, availability_status, max_open_calls
// level is a closed list: 'L1' | 'L2' | 'L3'
// joined with employees to expose the agent's name/email.

const FROM_BASE = 'FROM support_agents sa LEFT JOIN employees e ON (sa.employee_id = e.id) ';
const SELECT_BASE =
    'SELECT sa.*, e.first_name, e.last_name, e.email, e.phone,e.username ' +
    FROM_BASE;

// columns the client may filter by -> real SQL column + match type
const FILTER_WHITELIST = {
    name: { col: "CONCAT_WS(' ', e.first_name, e.last_name)", match: "like" },
    first_name: { col: "e.first_name", match: "like" },
    last_name: { col: "e.last_name", match: "like" },
    email: { col: "e.email", match: "like" },
    phone: { col: "e.phone", match: "like" },
    specialization: { col: "sa.specialization", match: "like" },
    availability_status: { col: "sa.availability_status", match: "eq" },
};

// columns the client may sort by -> real SQL column (only these can reach ORDER BY)
const SORT_WHITELIST = {
    id: "sa.id",
    level: "sa.level",
    specialization: "sa.specialization",
    availability_status: "sa.availability_status",
    max_open_calls: "sa.max_open_calls",
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
    return await pool.execute(SELECT_BASE + 'WHERE sa.id = ?', [id]);
}

async function getByEmployeeId(employee_id){
    return await pool.execute(SELECT_BASE + 'WHERE sa.employee_id = ?', [employee_id]);
}

async function createSupportAgent(agent,conn){
    const db = conn || pool;
    const { employee_id, level, specialization, availability_status, max_open_calls } = agent;
    const [result] = await db.execute(
      'INSERT INTO support_agents (employee_id, level, specialization, availability_status, max_open_calls) VALUES (?, ?, ?, ?, ?)',
      [employee_id, level, specialization, availability_status, max_open_calls]
    );
    return result;
}

async function updateById(id, agent){
    const { employee_id, level, specialization, availability_status, max_open_calls } = agent;
    await pool.execute(
      'UPDATE support_agents SET employee_id = ?, level = ?, specialization = ?, availability_status = ?, max_open_calls = ?,updated_at=NOW() WHERE id = ?',
      [employee_id, level, specialization, availability_status, max_open_calls, id]
    );
}

async function deleteById(id){
    await pool.execute('DELETE FROM support_agents WHERE id = ?', [id]);
}

export default {
  getAll,
  getById,
  getByEmployeeId,
  createSupportAgent,
  updateById,
  deleteById,
};
