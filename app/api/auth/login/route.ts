import { NextResponse } from "next/server"
import { login } from "@/lib/auth"

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

    return NextResponse.json(result)
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 }
    )
  }
}
