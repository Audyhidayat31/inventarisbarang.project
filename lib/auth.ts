import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import bcrypt from "bcryptjs"

const SESSION_COOKIE_NAME = "session_token"

export interface User {
  id: string
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

/**
 * Membuat session di database dan mengembalikan token.
 */
export async function createSession(userId: string): Promise<string> {
  const token = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 hari

  await prisma.session.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  })

  return token
}

/**
 * Set session cookie setelah login/register berhasil.
 */
export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 hari dalam detik
  })
}

/**
 * Memvalidasi token session dan mengembalikan data user.
 */
export async function validateSession(token: string): Promise<User | null> {
  try {
    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    })

    if (!session || session.expiresAt < new Date()) {
      // Hapus session yang expired
      if (session) {
        await prisma.session.delete({ where: { id: session.id } }).catch(() => {})
      }
      return null
    }

    return {
      id: session.user.id,
      username: session.user.username,
      email: session.user.email,
      full_name: session.user.name,
      role: session.user.role === "ADMIN" ? "admin" : "user",
    }
  } catch (error) {
    console.error("Validate session error:", error)
    return null
  }
}

/**
 * Mendapatkan user dari session cookie saat ini.
 * Digunakan oleh server components dan API routes.
 */
export async function getSession(): Promise<User | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value

    if (!token) {
      return null
    }

    return validateSession(token)
  } catch (error) {
    console.error("Get session error:", error)
    return null
  }
}

/**
 * Menghapus session dari database dan menghapus cookie.
 */
export async function destroySession(): Promise<void> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value

    if (token) {
      await prisma.session.deleteMany({
        where: { token },
      })
    }

    cookieStore.set(SESSION_COOKIE_NAME, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0, // Expire immediately
    })
  } catch (error) {
    console.error("Destroy session error:", error)
  }
}

/**
 * Menghapus session dari database berdasarkan token.
 */
export async function deleteSession(token: string): Promise<void> {
  await prisma.session.deleteMany({
    where: { token },
  })
}

/**
 * Login: validasi kredensial dan buat session.
 * Mengembalikan token dan data user jika sukses.
 */
export async function login(
  username: string,
  password: string
): Promise<{ success: boolean; error?: string; user?: User; token?: string }> {
  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email: username }],
      },
    })

    if (!user) {
      return { success: false, error: "Username atau password salah" }
    }

    const isValid = await verifyPassword(password, user.password)

    if (!isValid) {
      return { success: false, error: "Username atau password salah" }
    }

    const token = await createSession(user.id)

    return {
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.name,
        role: user.role === "ADMIN" ? "admin" : "user",
      },
    }
  } catch (error) {
    console.error("Login error:", error)
    return { success: false, error: "Terjadi kesalahan server" }
  }
}

/**
 * Register: buat user baru dan session.
 * Mengembalikan token dan data user jika sukses.
 */
export async function register(data: {
  username: string
  email: string
  password: string
  full_name: string
}): Promise<{ success: boolean; error?: string; user?: User; token?: string }> {
  try {
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ username: data.username }, { email: data.email }],
      },
    })

    if (existing) {
      return { success: false, error: "Username atau email sudah terdaftar" }
    }

    const passwordHash = await hashPassword(data.password)

    const user = await prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        password: passwordHash,
        name: data.full_name,
        role: "STAFF",
      },
    })

    const token = await createSession(user.id)

    return {
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.name,
        role: user.role === "ADMIN" ? "admin" : "user",
      },
    }
  } catch (error) {
    console.error("Register error:", error)
    return { success: false, error: "Terjadi kesalahan server" }
  }
}
