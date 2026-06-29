import pool from "../db.js";

// support_agents: id, employee_id, level, specialization, availability_status, max_open_calls
// level is a closed list: 'L1' | 'L2' | 'L3'
// joined with employees to expose the agent's name/email.

const SELECT_BASE =
    'SELECT sa.*, e.first_name, e.last_name, e.email, e.phone ' +
    'FROM support_agents sa LEFT JOIN employees e ON (sa.employee_id = e.id) ';

async function getAll(limit,offset){
    const [total] = await pool.execute('SELECT COUNT(*) AS total FROM support_agents');
    const [items] = await pool.execute(SELECT_BASE + 'ORDER BY e.first_name ASC, e.last_name ASC  LIMIT '+limit +' OFFSET '+offset);
    return {total:total[0]["total"],items:items};
}

async function getById(id){
    return await pool.execute(SELECT_BASE + 'WHERE sa.id = ?', [id]);
}

async function createSupportAgent(agent){
    const { employee_id, level, specialization, availability_status, max_open_calls } = agent;
    const [result] = await pool.execute(
      'INSERT INTO support_agents (employee_id, level, specialization, availability_status, max_open_calls) VALUES (?, ?, ?, ?, ?)',
      [employee_id, level, specialization, availability_status, max_open_calls]
    );
    return result;
}

async function updateById(id, agent){
    const { employee_id, level, specialization, availability_status, max_open_calls } = agent;
    await pool.execute(
      'UPDATE support_agents SET employee_id = ?, level = ?, specialization = ?, availability_status = ?, max_open_calls = ? WHERE id = ?',
      [employee_id, level, specialization, availability_status, max_open_calls, id]
    );
}

async function deleteById(id){
    await pool.execute('DELETE FROM support_agents WHERE id = ?', [id]);
}

export default {
  getAll,
  getById,
  createSupportAgent,
  updateById,
  deleteById,
};
