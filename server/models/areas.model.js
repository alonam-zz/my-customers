import pool from "../db.js";

// areas: id, code, name, parent_code, sort_order, is_active
// Returned shape matches the <Select> group contract:
//   [{ id, name, children: [{ id, name }] }, { id, name }]   (leaf value = area code)
// Top-level areas (no parent_code) become groups; their sub-areas become children.
// A top-level area with no children is returned as a plain leaf so it stays selectable.
async function getGroupedAreas(){
  const [rows] = await pool.execute(
    'SELECT * FROM areas WHERE is_active = 1 ORDER BY sort_order ASC, name ASC'
  );

  const parents = new Map(); // code -> group node
  const roots = [];          // ordered top-level nodes (groups or leaves)

  // pass 1: register every top-level area (no parent_code)
  for (const r of rows){
    if (!r.parent_code){
      const node = { id: r.code, name: r.name, children: [] };
      parents.set(r.code, node);
      roots.push(node);
    }
  }

  // pass 2: attach children; orphans (unknown parent) fall back to top-level leaves
  for (const r of rows){
    if (!r.parent_code) continue;
    const leaf = { id: r.code, name: r.name };
    const parent = parents.get(r.parent_code);
    if (parent) parent.children.push(leaf);
    else roots.push(leaf);
  }

  // collapse childless groups to plain leaves
  return roots.map((n) => (n.children && n.children.length ? n : { id: n.id, name: n.name }));
}

export default {
  getGroupedAreas,
};
