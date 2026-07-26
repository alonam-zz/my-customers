LOAD DATA LOCAL INFILE './csv/service_calls.csv' 
INTO TABLE service_calls 
CHARACTER SET utf8mb4 
FIELDS TERMINATED BY ';'
ENCLOSED BY '"' 
LINES TERMINATED BY '\n' 
IGNORE 1 ROWS 
-- assigned_*_id are loaded into throwaway vars and left NULL:
-- the source system's technician/support-agent ids don't exist in this DB.
(id,token,customer_id,title,description,status,priority,@sup,@tech,created_at,updated_at,type,product_id,service_id,price,score);
