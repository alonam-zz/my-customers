import pool from "../db.js";
import { getAgeScore,getUrgencyScore  } from "../helpers/score.js"; 

export async function UpdateCallScore(){
  const sql = "SELECT sc.id,sc.status,COALESCE(MAX(scl.created_at),sc.created_at) FROM service_calls sc "+
              "LEFT JOIN service_calls_lines scl ON (sc.id = scl.call_id) WHERE sc.status!='closed' "+
              "GROUP BY sc.id ";
  const [calls] = await pool.execute(sql);
  for (const call of calls ){
    const score =  getUrgencyScore(call);
    await pool.execute("UPDATE service_calls SET score=? WHERE id=?",[score,call.id]);  
  };  

 // process.exit(0);
}

UpdateCallScore();