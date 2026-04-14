import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const items = await sql`
      SELECT i.*, c.name as category_name
      FROM items i
      LEFT JOIN categories c ON i.category_id = c.id
      WHERE i.id = ${parseInt(id)}
    `

    if (items.length === 0) {
      return NextResponse.json({ error: "Item tidak ditemukan" }, { status: 404 })
    }

    return NextResponse.json(items[0])
  } catch (error) {
    console.error("Get item error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

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
    const { name, description, category_id, quantity, unit, min_stock, location, purchase_price, sale_price } = data

    if (!name || !category_id || quantity === undefined || !unit) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 })
    }

    const result = await sql`
      UPDATE items
      SET name = ${name},
          description = ${description || null},
          category_id = ${category_id},
          quantity = ${quantity},
          unit = ${unit},
          min_stock = ${min_stock || 0},
          location = ${location || null},
          purchase_price = ${purchase_price || 0},
          sale_price = ${sale_price || 0},
          updated_at = NOW()
      WHERE id = ${parseInt(id)}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Item tidak ditemukan" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Update item error:", error)
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

    const result = await sql`
      DELETE FROM items WHERE id = ${parseInt(id)}
      RETURNING id
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Item tidak ditemukan" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete item error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
