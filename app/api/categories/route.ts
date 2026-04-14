import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const categories = await sql`
      SELECT c.*, COUNT(i.id) as item_count
      FROM categories c
      LEFT JOIN items i ON c.id = i.category_id
      GROUP BY c.id
      ORDER BY c.name ASC
    `

    return NextResponse.json(categories)
  } catch (error) {
    console.error("Get categories error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    const { name, description } = data

    if (!name) {
      return NextResponse.json({ error: "Nama kategori wajib diisi" }, { status: 400 })
    }

    // Check if category already exists
    const existing = await sql`SELECT id FROM categories WHERE name = ${name}`
    if (existing.length > 0) {
      return NextResponse.json({ error: "Kategori sudah ada" }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO categories (name, description)
      VALUES (${name}, ${description || null})
      RETURNING *
    `

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Create category error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
