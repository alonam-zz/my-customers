// Builds a safe "WHERE" clause for list queries from a client-supplied filter.
//
// The filter object (e.g. { first_name: "dan", role: "admin" }) is untrusted, so
// column names are never interpolated: only keys present in `whitelist` are used,
// and every value goes through a `?` placeholder. `whitelist` maps a filter key to
// { col: <real SQL column/expr>, match: "like" | "eq" }:
//   - "like": case-insensitive contains  ->  col LIKE %value%
//   - "eq":   exact match                ->  col = value
//
// Returns { where, params } where `where` is either "" or begins with "WHERE ".
export function buildWhere(filter, whitelist) {
  if (!filter || typeof filter !== "object") return { where: "", params: [] };

  const clauses = [];
  const params = [];

  for (const [key, rawValue] of Object.entries(filter)) {
    const spec = whitelist[key];
    if (!spec) continue;                                   // not filterable -> ignore
    if (rawValue === "" || rawValue === null || rawValue === undefined) continue;

    if (spec.match === "like") {
      clauses.push(`${spec.col} LIKE ?`);
      params.push(`%${rawValue}%`);
    } else {
      clauses.push(`${spec.col} = ?`);
      params.push(rawValue);
    }
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")} ` : "";
  return { where, params };
}
