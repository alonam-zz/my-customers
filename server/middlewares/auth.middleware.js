import jwt from "jsonwebtoken";

export async function requireAuth(req, res, next) {
  const cookie_name = process.env.AUTH_COOKIE_NAME;
  try { 
    const token = req.cookies?.[cookie_name]; 
    if (!token) { 
      return res.status(401).json({ message: "Not authenticated" });
    }

    // verify the JWT set at login; its payload IS the user_obj
    // ({ id, username, role, first_name, last_name, email })
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // drop JWT metadata (iat/exp) — keep just the user fields
    const { iat, exp, ...user } = decoded;
    req.user = user;

    next();
  } catch (err) {
    // invalid or expired token — clear the bad cookie
    return res.clearCookie(cookie_name).status(401).json({ message: "Not authenticated" });
  }
}

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    next();
  };
}