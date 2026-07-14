import pool from "../db.js";

const BASE_SELECT  = "SELECT COUNT(*) as total";
const BASE_FROM = "FROM service_calls ";

async function getShortReportById(report,filter,limit,offset){ 
  let totalSql = BASE_SELECT +' '+BASE_FROM;
  if (report=="technician" || filter["assigned_technician_id"]){
    totalSql += 'LEFT JOIN technicians t ON (assigned_technician_id = t.id) ' +
           'LEFT JOIN employees te ON (t.employee_id = te.id) ';
  }

  if (report=="supportAgent" || filter["assigned_support_agent_id"]){
    totalSql += 'LEFT JOIN support_agents s ON (assigned_support_agent_id = s.id) ' +
           'LEFT JOIN employees se ON (s.employee_id = se.id) ';
  }

  let sql = "",fields = "";
  let where = "";
  let params = [];
  if (filter){
    where += Object.keys(filter).map((key)=>{

        if (Array.isArray(filter[key])){
          if (filter[key].length)
            params.push(...filter[key])
          else return "1=1";
          return key+" IN ("+filter[key].map((item)=>("?")).join(",")+")";
        }
        else{
          if (!filter[key]) return "1=1";
          params.push(filter[key]);
          switch (key){
            case "fromDate":
              return "service_calls.created_at>=?";
            case "toDate":
              return "service_calls.created_at<=?";
            case "status":
              return "status=?";
            case "priority":
              return "priority=?";
            case "type":
              return "type=?";
          }
      }
    }).join(" AND ");
  }

  totalSql += (where?"WHERE "+where+" ":"");

  const [res] = await pool.execute(totalSql,params);
  const total_calls = res[0]["total"];

  sql = BASE_SELECT +`,COUNT(*) *100/${total_calls} as percent,`;
  switch(report){
    case "status":
      sql += "status ";
      break;
    case "technician":
      sql += " CONCAT_WS(' ', te.first_name, te.last_name) AS technician_name , t.id ";
      break;
    case "supportAgent":
      sql += " CONCAT_WS(' ', se.first_name, se.last_name) AS support_agent_name , s.id ";
      break;
    case "type":
      sql += "type ";
      break;
  }
 
  sql += BASE_FROM;
  if (report=="technician"){
    sql += 'LEFT JOIN technicians t ON (assigned_technician_id = t.id) ' +
           'LEFT JOIN employees te ON (t.employee_id = te.id) ';
  }
   if (report=="supportAgent"){
    sql += 'LEFT JOIN support_agents s ON (assigned_support_agent_id = s.id) ' +
           'LEFT JOIN employees se ON (s.employee_id = se.id) ';
  }
  sql += (where?"WHERE "+where+" ":"");
  switch (report){
    case "status": //status,percent,
      sql += 'GROUP BY status ORDER BY status ';
      break;
    case "technician": //status,percent,
      sql += 'GROUP BY t.id ORDER BY technician_name ';
      break;
    case "supportAgent": //
      sql += 'GROUP BY s.id ORDER BY support_agent_name ';
      break;
    case "type": //status,percent,
      sql += 'GROUP BY type ORDER BY type ';
      break;
  }

  // const [total] = await pool.execute('SELECT COUNT(*) AS total from customers');
  const [items] = await pool.execute(sql +'LIMIT '+limit +' OFFSET '+offset, params);
  return {items:items};
    // const [result] = await pool.execute(
    //   'SELECT * FROM employees WHERE username=?',[username]
    // );
    // return result;
}


export default {
  getShortReportById
};
