import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"

export async function GET() {
  try {
    const user = await getSession()

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Tidak terautentikasi" },
        { status: 401 }
      )
    }

    return NextResponse.json({ success: true, user })
  } catch (error) {
    console.error("Get session error:", error)
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 }
    )
  }
}
