// Date/time helper functions.

// Pad a number to 2 digits: 5 -> "05"
const pad2 = (n) => String(n).padStart(2, "0");

/**
 * Parse a value (Date | ISO string | timestamp) into a Date, or null if invalid.
 */
export const toDate = (value) => {
  if (value == null || value === "") return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

/**
 * Format a datetime as "DD-MM-YY HH:MM" (e.g. 24-06-26 14:05).
 * Returns the fallback (default "") when the value is missing/invalid.
 */
export const formatDateTime = (value, fallback = "") => {
  const d = toDate(value);
  if (!d) return fallback;
  const date = `${pad2(d.getDate())}-${pad2(d.getMonth() + 1)}-${pad2(d.getFullYear() % 100)}`;
  const time = `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
  return `${date} ${time}`;
};

/**
 * Format just the date part as "DD-MM-YY".
 */
export const formatDate = (value, fallback = "") => {
  const d = toDate(value);
  if (!d) return fallback;
  return `${pad2(d.getDate())}-${pad2(d.getMonth() + 1)}-${pad2(d.getFullYear() % 100)}`;
};

/**
 * Format just the time part as "HH:MM".
 */
export const formatTime = (value, fallback = "") => {
  const d = toDate(value);
  if (!d) return fallback;
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
};
