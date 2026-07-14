// Builds a safe "ORDER BY" clause for list queries.
//
// sortBy/sort come from the client (untrusted), so they are never interpolated
// directly. `whitelist` maps an allowed sortBy key to the real SQL column
// expression (handles join aliases, e.g. { first_name: "e.first_name" }); only
// keys present in the whitelist can reach the SQL. `defaultOrder` is the full
// clause used when sortBy is missing or not whitelisted (preserves each list's
// original ordering).
//
// Returns a string beginning with "ORDER BY ".
export function buildOrderBy(sortBy, sortDir, whitelist, defaultOrder) {
  const column = whitelist[sortBy];
  if (!column) return `ORDER BY ${defaultOrder}`;
  const dir = String(sortDir).toUpperCase() === "DESC" ? "DESC" : "ASC";
  return `ORDER BY ${column} ${dir}`;
}
