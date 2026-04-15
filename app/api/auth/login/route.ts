import { NextResponse } from "next/server"
import { login, setSessionCookie } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: "Username dan password wajib diisi" },
        { status: 400 }
      )
    }

    const result = await login(username, password)

    if (!result.success) {
      return NextResponse.json(result, { status: 401 })
    }

    // Set session cookie
    if (result.token) {
      await setSessionCookie(result.token)
    }

    return NextResponse.json({
      success: true,
      user: result.user,
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 }
    )
  }
}
