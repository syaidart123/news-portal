import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function createToken(payload: {
  uid: string;
  email: string;
}): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyToken(
  token: string,
): Promise<{ uid: string; email: string } | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as { uid: string; email: string };
  } catch {
    return null;
  }
}

export function validatePassword(password: string): {
  valid: boolean;
  message: string;
} {
  if (password.length < 12) {
    return { valid: false, message: "Password minimal 12 karakter" };
  }
  if (!/[A-Z]/.test(password)) {
    return {
      valid: false,
      message: "Password harus mengandung minimal 1 huruf kapital",
    };
  }
  if (!/[0-9]/.test(password)) {
    return {
      valid: false,
      message: "Password harus mengandung minimal 1 angka",
    };
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return {
      valid: false,
      message: "Password harus mengandung minimal 1 simbol",
    };
  }
  return { valid: true, message: "" };
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
