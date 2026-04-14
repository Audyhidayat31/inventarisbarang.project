import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const category = searchParams.get("category") || ""

    let items
    if (search && category) {
      items = await sql`
        SELECT i.*, c.name as category_name
        FROM items i
        LEFT JOIN categories c ON i.category_id = c.id
        WHERE (i.name ILIKE ${"%" + search + "%"} OR i.description ILIKE ${"%" + search + "%"})
        AND i.category_id = ${parseInt(category)}
        ORDER BY i.created_at DESC
      `
    } else if (search) {
      items = await sql`
        SELECT i.*, c.name as category_name
        FROM items i
        LEFT JOIN categories c ON i.category_id = c.id
        WHERE i.name ILIKE ${"%" + search + "%"} OR i.description ILIKE ${"%" + search + "%"}
        ORDER BY i.created_at DESC
      `
    } else if (category) {
      items = await sql`
        SELECT i.*, c.name as category_name
        FROM items i
        LEFT JOIN categories c ON i.category_id = c.id
        WHERE i.category_id = ${parseInt(category)}
        ORDER BY i.created_at DESC
      `
    } else {
      items = await sql`
        SELECT i.*, c.name as category_name
        FROM items i
        LEFT JOIN categories c ON i.category_id = c.id
        ORDER BY i.created_at DESC
      `
    }

    return NextResponse.json(items)
  } catch (error) {
    console.error("Get items error:", error)
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
    const { name, description, category_id, quantity, unit, min_stock, location, purchase_price, sale_price } = data

    if (!name || !category_id || quantity === undefined || !unit) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO items (name, description, category_id, quantity, unit, min_stock, location, purchase_price, sale_price)
      VALUES (${name}, ${description || null}, ${category_id}, ${quantity}, ${unit}, ${min_stock || 0}, ${location || null}, ${purchase_price || 0}, ${sale_price || 0})
      RETURNING *
    `

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Create item error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
