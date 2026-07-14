INSERT INTO `customer_service`.`employees` (`first_name`, `last_name`, `email`, `username`, `role`, `is_active`) 
VALUES 
('admin', 'admin', 'alonam@gmail.com', 'admin', 'admin', '1');

INSERT INTO `customer_service`.`support_agents` (`employee_id`, `availability_status`) 
VALUES 
(LAST_INSERT_ID(), 'available');
