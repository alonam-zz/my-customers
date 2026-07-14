import pool from "../db.js";
import crypto from "node:crypto";
import { getAgeScore } from "../helpers/score.js";
import { buildOrderBy } from "../helpers/sort.js";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";

dayjs.extend(customParseFormat);

// service_calls joined twice to employees (via technicians / support_agents)
// to expose each side's first/last name. Aliases keep the two name pairs apart.
// FROM_BASE is shared by the COUNT and the SELECT so filters can reference the
// joined tables (e.g. t.employee_id / sa.employee_id) in both queries.
const FROM_BASE =
    'FROM service_calls sc ' +
    'LEFT JOIN customers c ON (sc.customer_id = c.id) ' +
    'LEFT JOIN technicians t ON (sc.assigned_technician_id = t.id) ' +
    'LEFT JOIN employees te ON (t.employee_id = te.id) ' +
    'LEFT JOIN support_agents sa ON (sc.assigned_support_agent_id = sa.id) ' +
    'LEFT JOIN employees se ON (sa.employee_id = se.id) ';

const SELECT_BASE =
    'SELECT sc.*, ' +
    "  CONCAT_WS(' ', te.first_name, te.last_name) AS technician_name,"+
    "CONCAT_WS(' ', se.first_name, se.last_name) AS support_agent_name, " +
    "c.name as customer_name "+
    FROM_BASE;

// filter keys the client may send -> real SQL column + how to match.
// Values are always bound with ? placeholders (injection-safe). Columns use the
// FROM_BASE aliases (sc/c/t/te/sa/se) so both COUNT and SELECT can reference them.
const CALLS_FILTER = {
  // report-panel filters
  // created_at:                { col: "sc.created_at",                 op: ">=" ,type:"date"},
  // created_at:                { col: "sc.created_at",                 op: "<=",type:"date" },
  // created_at:                { col: "sc.created_at",                 op: "=" ,type:"date"},
  status:                    { col: "sc.status",                     op: "set" },
  priority:                  { col: "sc.priority",                   op: "set" },
  type:                      { col: "sc.type",                       op: "set" },
  assigned_technician_id:    { col: "sc.assigned_technician_id",     op: "set" },
  assigned_support_agent_id: { col: "sc.assigned_support_agent_id",  op: "set" },
  technician_employee_id:    { col: "t.employee_id",                 op: "eq" },
  support_agent_employee_id: { col: "sa.employee_id",                op: "eq" },
  employee_id:               { col: "t.employee_id",                 op: "eq" }, // technician scoping
  // column filters (DataTable filter row)
  created_at:         { col: "sc.created_at",  op: "like" ,type:"date"}, // free-text match on the datetime string
  token:              { col: "sc.token",       op: "like" },
  title:              { col: "sc.title",       op: "like" },
  description:        { col: "sc.description",  op: "like" },
  customer_name:      { col: "c.name",         op: "like" },
  technician_name:    { col: "CONCAT_WS(' ', te.first_name, te.last_name)", op: "like" },
  support_agent_name: { col: "CONCAT_WS(' ', se.first_name, se.last_name)", op: "like" },
};

// Build WHERE clauses (as an array) + params from a client filter object.
function callFilterClauses(filter){
  const clauses = [];
  const params = [];
  if (!filter || typeof filter !== "object") return { clauses, params };
  for (const [key, value] of Object.entries(filter)){
    const spec = CALLS_FILTER[key];
    if (!spec) continue;
    switch (spec.op){
      case "set": // array -> IN, null -> IS NULL, "" -> skip, else = value
        if (Array.isArray(value)){
          if (!value.length) break;
          clauses.push(`${spec.col} IN (${value.map(() => "?").join(",")})`);
          params.push(...value);
        } else if (value === null){
          clauses.push(`${spec.col} IS NULL`);
        } else if (value !== "" && value !== undefined){
          clauses.push(`${spec.col} = ?`); params.push(value);
        }
        break;
      case "like":
        if (value !== "" && value != null){ 
          let val = value; 
          clauses.push(`${spec.col} LIKE ?`); params.push(`%${val}%`); 
        }
        break;
      default: // ">=", "<=", "eq"
        if (value !== "" && value != null){
          
          clauses.push(`${spec.col} ${spec.op === "eq" ? "=" : spec.op} ?`); params.push(value);
        }
    }
  }
  return { clauses, params };
}

// columns the client may sort by -> real SQL column (only these can reach ORDER BY)
const SORT_WHITELIST = {
  id: "sc.id",
  token: "sc.token",
  title: "sc.title",
  status: "sc.status",
  priority: "sc.priority",
  type: "sc.type",
  score: "sc.score",
  created_at: "sc.created_at",
  updated_at: "sc.updated_at",
  customer_name: "customer_name",
  technician_name: "technician_name",
  support_agent_name: "support_agent_name",
};
const DEFAULT_ORDER = "score";

async function getAll(sortBy,sortDir,limit,offset,filter){
    const orderBy = buildOrderBy(sortBy, sortDir, SORT_WHITELIST, DEFAULT_ORDER);
    const { clauses, params } = callFilterClauses(filter);
    const where = clauses.length ? "WHERE " + clauses.join(" AND ") + " " : "";
    const [total] = await pool.execute('SELECT COUNT(*) AS total ' + FROM_BASE + where, params);
    const [items] = await pool.execute(SELECT_BASE + where + orderBy + '  LIMIT '+limit +' OFFSET '+offset, params);
    return {total:total[0]["total"],items:items};
}

async function getById(id){
    return await pool.execute(SELECT_BASE + 'WHERE sc.id = ?', [id]);
}

async function getCustomerCalls(id,sortBy,sortDir,filter,limit,offset){
    const orderBy = buildOrderBy(sortBy, sortDir, SORT_WHITELIST, DEFAULT_ORDER);
    const { clauses, params } = callFilterClauses(filter);
    const allClauses = ["sc.customer_id = ?", ...clauses];
    const allParams = [id, ...params];
    // technician viewing a customer's calls only sees their own, still-open calls
    if (filter && filter.employee_id != null && filter.employee_id !== "")
      allClauses.push("sc.status != 'closed'");
    const where = "WHERE " + allClauses.join(" AND ") + " ";
    const [total] = await pool.execute('SELECT COUNT(*) AS total ' + FROM_BASE + where, allParams);
    const [items] = await pool.execute(SELECT_BASE + where + orderBy + ' LIMIT '+limit +' OFFSET '+offset, allParams);
    return {total:total[0]["total"],items:items};
}

async function createServiceCall(call){
    const {
      customer_id,title,description,status,priority,product_id, service_id,assigned_support_agent_id,assigned_technician_id,type} = call;
    const token = generateToken(16);
    const [result] = await pool.execute(
      'INSERT INTO service_calls (token,customer_id,title,description,status,priority,product_id, service_id,assigned_support_agent_id, assigned_technician_id,type) ' +
      'VALUES (?, ?, ?, ?,?, ?, ?, ?,?,?,?)',
      [token,customer_id,title,description,status,priority,product_id, service_id,assigned_support_agent_id, assigned_technician_id,type]
    );
    return result;
}

export function generateToken(length = 10) {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let token = "";

  for (let i = 0; i < length; i++) {
    const index = crypto.randomInt(0, chars.length);
    token += chars[index];
  }

  return token;
}


async function updateById(id, call){
    const {
      title,description,status,priority,service_id,assigned_support_agent_id,assigned_technician_id,type} = call;
    const score = getAgeScore(call,new Date().getTime());
    await pool.execute(
      'UPDATE service_calls SET title=?,description=?,status=?,priority=?,service_id=?,assigned_support_agent_id=?, assigned_technician_id=?,type=?,updated_at=NOW(),score=? WHERE id = ?',
      [title,description,status,priority,service_id,assigned_support_agent_id, assigned_technician_id,type,score,id]
    );
    const [updated] = await getById(id);

    return updated[0];
}

async function deleteById(id){
    await pool.execute('DELETE FROM service_calls WHERE id = ?', [id]);
}

async function customerCallsHasTechnician(id,technician_id){
    const [total] = await pool.execute('SELECT COUNT(*) as total FROM service_calls where customer_id=? AND assigned_technician_id=? AND status!="closed"',[id,technician_id]);    
    return total[0]["total"];
  }

  //technician can set the status only if he is the call technician 
async function updateFinishByTechnicianServicCall(id,user_id){
    await pool.execute('UPDATE service_calls sc '+
      'LEFT JOIN technicians t ON (sc.assigned_technician_id = t.id)  SET status="technician_completed" '+
      'WHERE sc.id = ? AND employee_id=?', [id,user_id]);
}

export default {
  getAll,
  getById,
  createServiceCall,
  getCustomerCalls,
  updateById,
  deleteById,
  customerCallsHasTechnician,
  updateFinishByTechnicianServicCall
};
