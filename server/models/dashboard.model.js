import pool from "../db.js";

async function getState(state){
    switch(state){
        case "1": return await getState1();
        case "2": return await getState2();
        case "3": return await getState3();
        case "4": return await getState4();
        case "5": return await getState5();
    }
    
}

async function getState1(){
    const [opened] = await pool.execute('SELECT COUNT(*) AS total from service_calls where status!="closed"');
    const [newToday] = await pool.execute('SELECT COUNT(*) AS total from service_calls where status="new" AND DATE(created_at)=CURDATE()');
    const [late] = [[{"total":0}]];
    const [waitingCustomer] = await pool.execute('SELECT COUNT(*) AS total from service_calls where status="waiting_customer"');
    const [waitingTechnician] = await pool.execute('SELECT COUNT(*) AS total from service_calls where status="waiting_technician"');
    const [closedToday] = await pool.execute('SELECT COUNT(*) AS total from service_calls where status="closed" AND DATE(updated_at)=CURDATE()');
   
    return {
        opened:opened[0]["total"],
        newToday:newToday[0]["total"],
        late:late[0]["total"],
        waitingCustomer:waitingCustomer[0]["total"],
        waitingTechnician:waitingTechnician[0]["total"],
        closedToday:closedToday[0]["total"]

    };
}

async function getState2(sortBy="score",sortDir="DESC"){ 
    const FROM_BASE =
    'FROM service_calls sc ' +
    'LEFT JOIN customers c ON (sc.customer_id = c.id) ' +
    'LEFT JOIN support_agents sa ON (sc.assigned_support_agent_id = sa.id) ' +
    'LEFT JOIN employees se ON (sa.employee_id = se.id) ';

    const SELECT_BASE =
    'SELECT sc.id,c.id as customer_id, sc.token,sc.title as description,status,sc.created_at as openedAt, ' +
    "CONCAT_WS(' ', se.first_name, se.last_name) AS support_agent, " +
    "c.name as customer_name,score "+
    FROM_BASE;

    const sql = `${SELECT_BASE} WHERE score>=50 ORDER BY ${sortBy} ${sortDir}  LIMIT 10`;  //,sc.created_at ASC

    const [lines] = await pool.execute(sql);
    
     
    return lines;
}

async function getState3(){
    const sql = `SELECT
    COUNT(DISTINCT sc.id) AS closedThisWeek,

    ROUND(
        AVG(TIMESTAMPDIFF(MINUTE, sc.created_at, sc.updated_at)) / 60/24,
        2
    ) AS avgHoursToClose,

    ROUND(
        AVG(TIMESTAMPDIFF(MINUTE, sc.created_at, first_lines.first_response_at)) / 60,
        2
    ) AS avgHoursToFirstResponse

    FROM service_calls sc

    LEFT JOIN (
    SELECT
        call_id,
        MIN(created_at) AS first_response_at
    FROM service_calls_lines
    GROUP BY call_id
    ) first_lines ON first_lines.call_id = sc.id

    WHERE sc.status = 'closed'
    AND sc.updated_at >= CURDATE() - INTERVAL 7 DAY
    `;
    const [lines] = await pool.execute(sql);
    return {
        avgHoursToClose:lines[0]["avgHoursToClose"]??0,
        avgHoursToFirstResponse:lines[0]["avgHoursToFirstResponse"]??0,
        closedThisWeek:lines[0]["closedThisWeek"]??0,
        
    };

}

async function getState4(){
    const sql = `
    SELECT
    assigned_support_agent_id,CONCAT (e.first_name,' ',e.last_name) as support_agent,
    SUM(CASE WHEN score >=60  THEN 1 ELSE 0 END) AS late,
    SUM(CASE WHEN status != 'closed' THEN 1 ELSE 0 END) AS open,
    SUM(
        CASE
        WHEN status = 'closed'
        AND sc.updated_at >= CURDATE()
        AND sc.updated_at < CURDATE() + INTERVAL 1 DAY
        THEN 1
        ELSE 0
        END
    ) AS closedToday
    FROM service_calls sc
    LEFT JOIN support_agents sa ON (sc.assigned_support_agent_id = sa.id) 
    LEFT JOIN employees e ON (sa.employee_id = e.id) 
    GROUP BY assigned_support_agent_id`;

    const [lines] = await pool.execute(sql);
    
     
    return lines;
}

async function getState5(sortBy="score",sortDir="DESC"){
    let noUpdate24h=0,noUpdate36h = 0,waitingTechAssign = 0,noResponsible=0;
    let calls = [];
    const sql1 = `SELECT sc.id,c.name as customer_name,c.id as customer_id,sc.token,sc.title,TIMESTAMPDIFF(MINUTE,MAX(scl.updated_at),NOW())/(60) as hours,
        sc.status,sc.assigned_support_agent_id
        FROM customer_service.service_calls sc  
        LEFT JOIN customer_service.service_calls_lines scl ON (sc.id = scl.call_id)  
        LEFT JOIN customer_service.customers c  ON (sc.customer_id = c.id)  
        where sc.status!='closed' 
        GROUP BY sc.id
         HAVING  hours>24 OR 
        assigned_support_agent_id IS NULL
        OR 
        status='waiting_technician' ORDER BY ${sortBy} ${sortDir}`;
    const data1 = await pool.execute(sql1);
    for (let d1 of data1[0]){
        let problem = [];
    
        if (d1.hours>=36 || d1.hour==null) {
            problem.push("noUpdate36h");
            noUpdate36h++;
        }
        else if (d1.hours>=24){ 
            problem.push("noUpdate24h");
            noUpdate24h++;
        }
        if (d1.status=="waiting_technician"){
            problem.push("waitingTechAssign");
            waitingTechAssign++;
        }
        if (!d1.assigned_support_agent_id){
            problem.push("noResponsible");
            noResponsible++;
        }
        
        calls.push({...d1,problem:problem});
    }

    return {summary:{
        noUpdate24h:noUpdate24h,
        noUpdate36h:noUpdate36h,
        noResponsible:noResponsible,
        waitingTechAssign:waitingTechAssign,
        },
        calls:calls
    };
} 


export default {
  getState,

};