LOAD DATA LOCAL INFILE './csv/israel_areas_subareas.csv' 
INTO TABLE areas 
CHARACTER SET utf8mb4 
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"' 
LINES TERMINATED BY '\n' 
IGNORE 1 ROWS 
(code, name,parent_code, sort_order, is_active);
