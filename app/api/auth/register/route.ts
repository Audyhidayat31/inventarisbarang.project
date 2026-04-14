import { NextResponse } from "next/server"
import { register } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const { username, email, password, full_name } = await request.json()

    if (!username || !email || !password || !full_name) {
      return NextResponse.json(
        { success: false, error: "Semua field wajib diisi" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password minimal 6 karakter" },
        { status: 400 }
      )
    }

    const result = await register({ username, email, password, full_name })

    if (!result.success) {
      return NextResponse.json(result, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Register error:", error)
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 }
    )
  }
}
