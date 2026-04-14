import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const data = await request.json()
    const { name, description } = data

    if (!name) {
      return NextResponse.json({ error: "Nama kategori wajib diisi" }, { status: 400 })
    }

    // Check if another category with the same name exists
    const existing = await sql`SELECT id FROM categories WHERE name = ${name} AND id != ${parseInt(id)}`
    if (existing.length > 0) {
      return NextResponse.json({ error: "Kategori dengan nama ini sudah ada" }, { status: 400 })
    }

    const result = await sql`
      UPDATE categories
      SET name = ${name}, description = ${description || null}
      WHERE id = ${parseInt(id)}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Kategori tidak ditemukan" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Update category error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Check if category has items
    const itemsCount = await sql`SELECT COUNT(*) as count FROM items WHERE category_id = ${parseInt(id)}`
    if (parseInt(itemsCount[0].count) > 0) {
      return NextResponse.json({ error: "Tidak dapat menghapus kategori yang memiliki barang" }, { status: 400 })
    }

    const result = await sql`
      DELETE FROM categories WHERE id = ${parseInt(id)}
      RETURNING id
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Kategori tidak ditemukan" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete category error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
