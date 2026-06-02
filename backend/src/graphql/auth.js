import jwt from "jsonwebtoken";
import { unauthorized } from "../utils/errors.js";

export function signToken(user) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");

  return jwt.sign(
    { sub: user._id.toString(), username: user.username, email: user.email },
    secret,
    { expiresIn: "2h" }
  );
}

export function getUserFromAuthHeader(authHeader) {
  if (!authHeader) return null;
  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) return null;

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    return payload;
  } catch {
    return null;
  }
}

export function requireAuth(context) {
  if (!context?.authUser) throw unauthorized("Login required (missing/invalid token)");
  return context.authUser;
}