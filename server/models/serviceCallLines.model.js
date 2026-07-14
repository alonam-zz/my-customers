import pool from "../db.js";
import { buildOrderBy } from "../helpers/sort.js";


// service_calls joined twice to employees (via technicians / support_agents)
// to expose each side's first/last name. Aliases keep the two name pairs apart.
const SELECT_BASE =
    'SELECT scl.id, scl.call_id,scl.description,scl.status,scl.employee_id,scl.created_at,scl.updated_at,' +
    " CONCAT_WS(' ', te.first_name, te.last_name) AS employee_name "+
    'FROM service_calls_lines scl ' +
    'LEFT JOIN employees te ON (scl.employee_id = te.id) ';

// columns the client may sort by -> real SQL column (only these can reach ORDER BY)
const SORT_WHITELIST = {
    id: "scl.id",
    status: "scl.status",
    created_at: "scl.created_at",
    updated_at: "scl.updated_at",
    employee_name: "employee_name",
};
const DEFAULT_ORDER = "created_at DESC";

async function getAll(sortBy,sortDir,limit,offset){
    const orderBy = buildOrderBy(sortBy, sortDir, SORT_WHITELIST, DEFAULT_ORDER);
    const [total] = await pool.execute('SELECT COUNT(*) AS total FROM service_calls_lines');
    const [items] = await pool.execute(SELECT_BASE + orderBy + '  LIMIT '+limit +' OFFSET '+offset);
    return {total:total[0]["total"],items:items};
}

async function getByCallId(id,sortBy,sortDir,limit,offset){
  const orderBy = buildOrderBy(sortBy, sortDir, SORT_WHITELIST, DEFAULT_ORDER);
  const [total] = await pool.execute('SELECT COUNT(*) AS total FROM service_calls_lines WHERE call_id = ?', [id]);
  const [items] = await pool.execute(SELECT_BASE + 'WHERE scl.call_id = ? '+orderBy+' LIMIT '+limit +' OFFSET '+offset, [id]);
  return {total:total[0]["total"],items:items};
}

async function getById(id){
    return await pool.execute(SELECT_BASE + 'WHERE scl.id=?', [id]);
}


async function createServiceCallLine(call_id,call_line){ 
    const {description,status,employee_id} = call_line;
    const [result] = await pool.execute(
      'INSERT INTO service_calls_lines (call_id,description,status,employee_id) ' +
      'VALUES (?, ?, ?, ?)',
      [call_id,description,status,employee_id]
    );
    return result;
}



export default {
  getAll,
  getById,
  getByCallId,
  createServiceCallLine,
};
