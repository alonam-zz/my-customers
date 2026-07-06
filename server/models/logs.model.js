import pool from "../db.js";

const BASE_SELECT  = "SELECT logs.id,log_id,description,CONCAT_WS(' ', e.first_name, e.last_name) AS employee_name,date  ";
const BASE_FROM  = "FROM logs  LEFT JOIN employees e ON (logs.employee_id = e.id) ";

async function getLogs(filter,limit,offset){  console.log(filter);
  
  let sql = "",fields = "";
  let params = [];
  let where = "";
  
  if (filter){ 
    where += Object.keys(filter).map((key)=>{ console.log(key+'ddd '+filter[key]);
        
        if (Array.isArray(filter[key])){ console.log(" array "+key)
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
              return "logs.date>=?";
            case "toDate":
              return "logs.date<=?";
            case "employee_id":
              return "employee_id=?";
            case "log_id":
              return "log_id=?"
          }
      }
    }).join(" AND ");
  }

  
  sql = BASE_SELECT+BASE_FROM;
  sql += where?("WHERE "+where+" "):"";
  
  let totalSql = "SELECT COUNT(*) as total "+BASE_FROM;
  totalSql += where?("WHERE "+where+" "):"";

  console.log(sql);
  console.log(params);
  const [total] = await pool.execute(totalSql,params); console.log(totalSql);
  const [items] = await pool.execute(sql +'LIMIT '+limit +' OFFSET '+offset, params);
 return {total:total[0]["total"],items:items};

}

async function createLog(log){
    const { log_id, employee_id, description} = log;
    const result = await pool.execute(
      'INSERT INTO logs (log_id, employee_id, description) VALUES (?, ?, ?)',
      [log_id, employee_id, description]
    );

     return [result];
}

export default {
  getLogs,
  createLog
};
