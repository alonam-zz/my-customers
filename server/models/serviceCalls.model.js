import pool from "../db.js";


// service_calls joined twice to employees (via technicians / support_agents)
// to expose each side's first/last name. Aliases keep the two name pairs apart.
const SELECT_BASE =
    'SELECT sc.*, ' +
    "  CONCAT_WS(' ', te.first_name, te.last_name) AS technician_name,"+
    "CONCAT_WS(' ', se.first_name, se.last_name) AS support_agent_name " +
    'FROM service_calls sc ' +
    'LEFT JOIN technicians t ON (sc.assigned_technician_id = t.id) ' +
    'LEFT JOIN employees te ON (t.employee_id = te.id) ' +
    'LEFT JOIN support_agents sa ON (sc.assigned_support_agent_id = sa.id) ' +
    'LEFT JOIN employees se ON (sa.employee_id = se.id) ';

async function getAll(limit,offset){
    const [total] = await pool.execute('SELECT COUNT(*) AS total FROM service_calls');
    const [items] = await pool.execute(SELECT_BASE +'  LIMIT '+limit +' OFFSET '+offset);
    return {total:total[0]["total"],items:items};
}

async function getById(id){
    return await pool.execute(SELECT_BASE + 'WHERE sc.id = ?', [id]);
}

async function getCustomerCalls(id,limit,offset){
    const [total] = await pool.execute('SELECT COUNT(*) AS total FROM service_calls WHERE customer_id = ?', [id]);
    const [items] = await pool.execute(SELECT_BASE + 'WHERE sc.customer_id = ?  LIMIT '+limit +' OFFSET '+offset, [id]);
    return {total:total[0]["total"],items:items};
}

async function createServiceCall(call){ console.log(call);
    const {
      customer_id,title,description,status,priority,product_id, service_id,assigned_support_agent_id,assigned_technician_id,type} = call;
    const [result] = await pool.execute(
      'INSERT INTO service_calls (customer_id,title,description,status,priority,product_id, service_id,assigned_support_agent_id, assigned_technician_id,type) ' +
      'VALUES (?, ?, ?, ?, ?, ?, ?,?,?,?)',
      [customer_id,title,description,status,priority,product_id, service_id,assigned_support_agent_id, assigned_technician_id,type]
    );
    return result;
}

async function updateById(id, call){
    const {
      title,description,status,priority,service_id,assigned_support_agent_id,assigned_technician_id,type} = call;
    await pool.execute(
      'UPDATE service_calls SET title=?,description=?,status=?,priority=?,service_id=?,assigned_support_agent_id=?, assigned_technician_id=?,type=? WHERE id = ?',
      [title,description,status,priority,service_id,assigned_support_agent_id, assigned_technician_id,type,id]
    );
    const [updated] = await getById(id); console.log("----",updated)
    return updated[0];
}

async function deleteById(id){
    await pool.execute('DELETE FROM service_calls WHERE id = ?', [id]);
}

export default {
  getAll,
  getById,
  createServiceCall,
  getCustomerCalls,
  updateById,
  deleteById,
};
