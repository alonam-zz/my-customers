-- Import customers from server/customers_hebrew.csv (COMMA-delimited; \N means NULL).
-- No id column in the CSV: AUTO_INCREMENT is reset to 1 before load (see run command)
-- so ids follow file order (1..N) and line up with service_calls.customer_id.
LOAD DATA LOCAL INFILE './csv/customers_hebrew.csv'
INTO TABLE customers
CHARACTER SET utf8mb4
FIELDS TERMINATED BY ',' ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(type,name,first_name,last_name,phone,phone2,email,address,is_lead,priority,is_active);
