import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

export function authRequired(req, res, next) {
  const h = req.headers.authorization;
  const token = h?.startsWith("Bearer ") ? h.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "dev-secret");
    req.userId = payload.sub;
    req.userRole = payload.role;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

export function roleRequired(...roles) {
  return (req, res, next) => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      return res.status(403).json({ error: "Forbidden for this role" });
    }
    next();
  };
}

export async function attachUser(req, res, next) {
  try {
    const user = await User.findById(req.userId).select("-passwordHash");
    if (!user) return res.status(401).json({ error: "User not found" });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }
}
