-- Import employees (technicians + support agents / users)
-- Passwords are stored as NULL (set later via the activation flow, like the admin account).
-- Safe to re-run: existing emails are skipped, subtype rows are only added when missing.

INSERT IGNORE INTO employees (first_name, last_name, email, username, password, phone, role, is_active) VALUES
('Daniel', 'Cohen',    'daniel.cohen@example.com', 'daniel.cohen', NULL, '050-1111111', 'technician', 1),
('Avi',    'Levi',     'avi.levi@example.com',     'avi.levi',     NULL, '050-2222222', 'technician', 1),
('Noa',    'Mizrahi',  'noa.mizrahi@example.com',  'noa.mizrahi',  NULL, '050-3333333', 'technician', 1),
('Maya',   'Israeli',  'maya.israeli@example.com', 'maya.israeli', NULL, '050-4444444', 'support',    1),
('Tamar',  'Peretz',   'tamar.peretz@example.com', 'tamar.peretz', NULL, '050-5555555', 'support',    1),
('Yossi',  'Biton',    'yossi.biton@example.com',  'yossi.biton',  NULL, '050-6666666', 'support',    1);

-- Create a technicians row for every technician-role employee that doesn't have one yet
INSERT INTO technicians (employee_id, availability_status)
SELECT e.id, 'available'
FROM employees e
WHERE e.role = 'technician'
  AND NOT EXISTS (SELECT 1 FROM technicians t WHERE t.employee_id = e.id);

-- Create a support_agents row for every support-role employee that doesn't have one yet
INSERT INTO support_agents (employee_id, availability_status)
SELECT e.id, 'available'
FROM employees e
WHERE e.role = 'support'
  AND NOT EXISTS (SELECT 1 FROM support_agents s WHERE s.employee_id = e.id);
