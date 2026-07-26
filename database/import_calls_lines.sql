LOAD DATA LOCAL INFILE './csv/service_calls_lines.csv' 
INTO TABLE service_calls_lines 
CHARACTER SET utf8mb4 
FIELDS TERMINATED BY ';'
ENCLOSED BY '"' 
LINES TERMINATED BY '\n' 
IGNORE 1 ROWS 
-- employee_id loaded into a throwaway var and left NULL (source id not present here).
(id,call_id,description,status,@emp,created_at,updated_at);
