/* ---------- option lists (values are i18n suffixes) ---------- */
export const CALL_STATUSES = ["new", "open", "in_progress", "waiting_customer","waiting_technician", "closed"];
export const CALL_PRIORITIES = ["low", "mid", "high", "urgent"];
export const CALL_TYPES = ["installation", "maintenance", "question", "fault","complaint", "billing", "warranty", "upgrade", "emergency", "other"];
export const SOURCES = ["phone", "website", "whatsapp", "email"];
export const CREATED_BY = ["customer", "rep"];
export const CUSTOMER_STATUSES = ["in_active","active"];
// employee roles — must match ALLOWED_ROLES in employeesController.js
export const EMPLOYEE_ROLES = ["admin", "manager", "support", "technician", "sales"];

export const MANAGER_ROLES = ["admin", "manager"];

export const ALL_LOGS = ["service_calls","employees","products","customers","services"];

export const STATUS_BADGE = {
  new: "text-bg-secondary",
  open: "text-bg-primary", 
  in_progress: "text-bg-info",
  waiting_customer: "text-bg-warning",
  waiting_technician: "text-bg-danger",
  resolved: "text-bg-success",
  closed: "text-bg-dark",
};

export const STATUS_BADGE_COLORS = {
    new: "--bg-secondary",
    open: "--bg-primary",
    in_progress: "--bg-info",
    waiting_customer: "--bg-warning",
    waiting_technician: "--bg-danger",
    resolved: "--bg-success",
    closed: "--bg-dark",
  };

export const PRIORITY_BADGE = {
  LOW: "text-bg-secondary",
  MID: "text-bg-info",
  HIGH: "text-bg-warning",
  URGENT: "text-bg-danger",
};

export const CUSTOMER_PRIORITY = ["regular","vip"]
export const CUSTOMER_TYPE = ["private","business","institue"]

export const PAGE_SIZE = 20;
