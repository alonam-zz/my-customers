/* ---------- option lists (values are i18n suffixes) ---------- */
export const CALL_STATUSES = ["new", "open", "in_progress", "technician_completed","waiting_customer","waiting_technician", "closed"];
export const CALL_PRIORITIES = ["low", "mid", "high", "urgent"];
export const CALL_TYPES = ["installation", "maintenance", "question", "fault","complaint", "billing", "warranty", "upgrade", "emergency", "other"];
export const SOURCES = ["phone", "website", "whatsapp", "email"];
export const CREATED_BY = ["customer", "rep"];
export const CUSTOMER_STATUSES = ["in_active","active"];
// employee roles — must match ALLOWED_ROLES in employeesController.js
export const EMPLOYEE_ROLES = ["admin", "manager", "support", "technician",];// "sales"];
export const AVAILABILITY = ["available", "busy", "away", "inactive"];

export const MANAGER_ROLES = ["admin", "manager"];

export const SERVICE_ROLES = ["admin", "manager","support"];

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

  

  export const TYPE_BADGE_COLORS = {
    installation: "--type-installation",
    maintenance:  "--type-maintenance",
    question:     "--type-question",
    fault:        "--type-fault",
    complaint:    "--type-complaint",
    billing:      "--type-billing",
    warranty:     "--type-warranty",
    upgrade:      "--type-upgrade",
    emergency:    "--type-emergency",
    other:        "--type-other",
  };

// full palette of color CSS vars — resolve with getPropertyValue(root, name).
// distinct --type-* first, then the --bg-* set; cycle for charts with many series.
export const CHART_COLORS = [
  "--type-installation",
  "--type-maintenance",
  "--type-question",
  "--type-fault",
  "--type-complaint",
  "--type-billing",
  "--type-warranty",
  "--type-upgrade",
  "--type-emergency",
  "--type-other",
  "--bg-primary",
  "--bg-secondary",
  "--bg-info",
  "--bg-warning",
  "--bg-danger",
  "--bg-success",
  "--bg-dark",
];

export const PRIORITY_BADGE = {
  LOW: "text-bg-secondary",
  MID: "text-bg-info",
  HIGH: "text-bg-warning",
  URGENT: "text-bg-danger",
};

export const CUSTOMER_PRIORITY = ["regular","vip"]
export const CUSTOMER_TYPE = ["private","business","institue"]

export const PAGE_SIZE = 20;


export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;