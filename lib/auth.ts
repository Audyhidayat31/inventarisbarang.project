import { cookies } from "next/headers"
import { sql } from "./db"
import bcrypt from "bcryptjs"

export interface User {
  id: number
  username: string
  email: string
  full_name: string
  role: "admin" | "user"
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function createSession(userId: number): Promise<string> {
  const token = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

  await sql`
    INSERT INTO sessions (user_id, token, expires_at)
    VALUES (${userId}, ${token}, ${expiresAt.toISOString()})
  `

  const cookieStore = await cookies()
  cookieStore.set("session_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  })

  return token
}

export async function getSession(): Promise<User | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("session_token")?.value

  if (!token) return null

  const sessions = await sql`
    SELECT u.id, u.username, u.email, u.full_name, u.role
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.token = ${token} AND s.expires_at > NOW()
  `

  if (sessions.length === 0) return null

  return sessions[0] as User
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies()
  const token = cookieStore.get("session_token")?.value

  if (token) {
    await sql`DELETE FROM sessions WHERE token = ${token}`
    cookieStore.delete("session_token")
  }
}

export async function login(username: string, password: string): Promise<{ success: boolean; error?: string; user?: User }> {
  const users = await sql`
    SELECT id, username, email, full_name, role, password_hash
    FROM users
    WHERE username = ${username} OR email = ${username}
  `

  if (users.length === 0) {
    return { success: false, error: "Username atau password salah" }
  }

  const user = users[0]
  const isValid = await verifyPassword(password, user.password_hash)

  if (!isValid) {
    return { success: false, error: "Username atau password salah" }
  }

  await createSession(user.id)

  return {
    success: true,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
    },
  }
}

export async function register(data: {
  username: string
  email: string
  password: string
  full_name: string
}): Promise<{ success: boolean; error?: string; user?: User }> {
  // Check if username or email already exists
  const existing = await sql`
    SELECT id FROM users WHERE username = ${data.username} OR email = ${data.email}
  `

  if (existing.length > 0) {
    return { success: false, error: "Username atau email sudah terdaftar" }
  }

  const passwordHash = await hashPassword(data.password)

  const result = await sql`
    INSERT INTO users (username, email, password_hash, full_name, role)
    VALUES (${data.username}, ${data.email}, ${passwordHash}, ${data.full_name}, 'user')
    RETURNING id, username, email, full_name, role
  `

  const user = result[0] as User
  await createSession(user.id)

  return { success: true, user }
}
