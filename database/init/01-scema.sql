CREATE TABLE `areas` (
  `code` varchar(50) DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `parent_code` varchar(50) DEFAULT NULL,
  `sort_order` int DEFAULT NULL,
  `is_active` tinyint DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `customer_products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `customer_id` int NOT NULL,
  `product_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique` (`customer_id`,`product_id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `customers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type` enum('private','business','institue') NOT NULL DEFAULT 'private',
  `name` varchar(100) DEFAULT NULL,
  `first_name` varchar(45) DEFAULT NULL,
  `last_name` varchar(45) DEFAULT NULL,
  `phone` varchar(45) DEFAULT NULL,
  `phone2` varchar(45) DEFAULT NULL,
  `email` varchar(45) DEFAULT NULL,
  `address` varchar(45) DEFAULT NULL,
  `region` varchar(50) DEFAULT NULL,
  `is_lead` tinyint(1) DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `priority` enum('regular','vip') NOT NULL DEFAULT 'regular',
  `is_active` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `employees` (
  `id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(45) NOT NULL,
  `last_name` varchar(45) NOT NULL,
  `email` varchar(45) NOT NULL,
  `username` varchar(45) NOT NULL,
  `password` varchar(100) DEFAULT NULL,
  `phone` varchar(45) DEFAULT NULL,
  `role` enum('admin','manager','support','technician','sales') NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `last_login_at` datetime DEFAULT NULL,
  `activation_token` varchar(100) DEFAULT NULL,
  `activation_timeout` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email_UNIQUE` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `log_id` varchar(50) NOT NULL,
  `description` text,
  `employee_id` int NOT NULL,
  `date` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `LOG_ID` (`log_id`),
  KEY `EMPLOYEE` (`employee_id`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(45) DEFAULT NULL,
  `description` varchar(45) DEFAULT NULL,
  `sku` varchar(100) DEFAULT NULL,
  `price` varchar(45) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `service_call_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `service_call_id` int NOT NULL,
  `employee_id` int NOT NULL,
  `action` varchar(100) NOT NULL,
  `old_value` text,
  `new_value` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;



CREATE TABLE `services` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `product_id` varchar(45) DEFAULT NULL,
  `description` varchar(45) DEFAULT NULL,
  `price` varchar(45) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `support_agents` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` int NOT NULL,
  `level` enum('L1','L2','L3') DEFAULT 'L1',
  `specialization` varchar(100) DEFAULT NULL,
  `availability_status` enum('available','busy','away','inactive') DEFAULT 'available',
  `max_open_calls` int DEFAULT '20',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `employee_id` (`employee_id`),
  CONSTRAINT `support_agents_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `technicians` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` int NOT NULL,
  `region` varchar(100) DEFAULT NULL,
  `specialization` varchar(100) DEFAULT NULL,
  `availability_status` enum('available','busy','away','inactive') DEFAULT 'available',
  `max_daily_visits` int DEFAULT '6',
  `is_external` tinyint(1) DEFAULT '0',
  `vehicle_number` varchar(50) DEFAULT NULL,
  `notes` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `employee_id` (`employee_id`),
  CONSTRAINT `technicians_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE `service_calls` (
  `id` int NOT NULL AUTO_INCREMENT,
  `token` varchar(50) NOT NULL,
  `customer_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `status` enum('new','open','in_progress','technician_completed','waiting_customer','waiting_technician','closed') DEFAULT NULL,
  `priority` enum('urgent','high','mid','low') NOT NULL,
  `assigned_support_agent_id` int DEFAULT NULL,
  `assigned_technician_id` int DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `type` enum('installation','maintenance','question','fault','complaint','billing','warranty','upgrade','emergency','other') DEFAULT 'fault',
  `product_id` int DEFAULT NULL,
  `service_id` int DEFAULT NULL,
  `price` varchar(45) DEFAULT NULL,
  `score` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_service_calls_IBFK_2_idx` (`assigned_technician_id`),
  KEY `service_calls_ibfk_1_idx` (`assigned_support_agent_id`),
  KEY `service_call_status_idx` (`status`),
  KEY `service_call_updated_at` (`updated_at`),
  CONSTRAINT `fk_service_calls_IBFK_2` FOREIGN KEY (`assigned_technician_id`) REFERENCES `technicians` (`id`),
  CONSTRAINT `service_calls_ibfk_1` FOREIGN KEY (`assigned_support_agent_id`) REFERENCES `support_agents` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=59 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `service_calls_lines` (
  `id` int NOT NULL AUTO_INCREMENT,
  `call_id` int NOT NULL,
  `description` text,
  `status` enum('new','open','in_progress','technician_completed','waiting_customer','waiting_technician','closed') DEFAULT NULL,
  `employee_id` int DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_service_calls_IBFK_2_idx` (`employee_id`),
  KEY `fk_service_calls__lines_IBFK_1` (`call_id`),
  CONSTRAINT `fk_service_calls__lines_IBFK_1` FOREIGN KEY (`call_id`) REFERENCES `service_calls` (`id`),
  CONSTRAINT `fk_service_calls__lines_IBFK_2` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=135 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
