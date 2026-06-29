import pool from "../db.js";


// service_calls joined twice to employees (via technicians / support_agents)
// to expose each side's first/last name. Aliases keep the two name pairs apart.
const SELECT_BASE =
    'SELECT scl.id, scl.call_id,scl.description,scl.status,scl.employee_id,scl.created_at,scl.updated_at,' +
    " CONCAT_WS(' ', te.first_name, te.last_name) AS employee_name "+
    'FROM service_calls_lines scl ' +
    'LEFT JOIN employees te ON (scl.employee_id = te.id) ';

async function getAll(limit,offset){
    const [total] = await pool.execute('SELECT COUNT(*) AS total FROM service_calls_lines');
    const [items] = await pool.execute(SELECT_BASE +'  LIMIT '+limit +' OFFSET '+offset);
    return {total:total[0]["total"],items:items};
}

async function getByCallId(id,limit,offset){
  const [total] = await pool.execute('SELECT COUNT(*) AS total FROM service_calls_lines WHERE call_id = ?', [id]);
  const [items] = await pool.execute(SELECT_BASE + 'WHERE scl.call_id = ? ORDER BY created_at ASC LIMIT '+limit +' OFFSET '+offset, [id]);
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

// async function updateById(id, call){
//     const {
//       title,description,status,priority,service_id,assigned_support_agent_id,assigned_technician_id,type} = call;
//     await pool.execute(
//       'UPDATE service_calls SET title=?,description=?,status=?,priority=?,service_id=?,assigned_support_agent_id=?, assigned_technician_id=?,type=? WHERE id = ?',
//       [title,description,status,priority,service_id,assigned_support_agent_id, assigned_technician_id,type,id]
//     );
//     const [updated] = await getById(id); console.log("----",updated)
//     return updated[0];
// }

async function deleteById(id){
    await pool.execute('DELETE FROM service_calls WHERE id = ?', [id]);
}

export default {
  getAll,
  getById,
  getByCallId,
  createServiceCallLine,
};
