import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get total items count
    const totalItemsResult = await sql`SELECT COUNT(*) as count FROM items`
    const totalItems = parseInt(totalItemsResult[0].count)

    // Get total categories count
    const totalCategoriesResult = await sql`SELECT COUNT(*) as count FROM categories`
    const totalCategories = parseInt(totalCategoriesResult[0].count)

    // Get low stock items count
    const lowStockResult = await sql`SELECT COUNT(*) as count FROM items WHERE quantity <= min_stock`
    const lowStockItems = parseInt(lowStockResult[0].count)

    // Get total inventory value
    const totalValueResult = await sql`SELECT COALESCE(SUM(quantity * purchase_price), 0) as total FROM items`
    const totalValue = parseFloat(totalValueResult[0].total)

    // Get items by category
    const itemsByCategory = await sql`
      SELECT c.name as category, COUNT(i.id) as count
      FROM categories c
      LEFT JOIN items i ON c.id = i.category_id
      GROUP BY c.id, c.name
      ORDER BY count DESC
    `

    // Get recent items
    const recentItems = await sql`
      SELECT i.*, c.name as category_name
      FROM items i
      LEFT JOIN categories c ON i.category_id = c.id
      ORDER BY i.created_at DESC
      LIMIT 5
    `

    // Get low stock items list
    const lowStockList = await sql`
      SELECT i.*, c.name as category_name
      FROM items i
      LEFT JOIN categories c ON i.category_id = c.id
      WHERE i.quantity <= i.min_stock
      ORDER BY i.quantity ASC
      LIMIT 10
    `

    return NextResponse.json({
      total_items: totalItems,
      total_categories: totalCategories,
      low_stock_items: lowStockItems,
      total_value: totalValue,
      items_by_category: itemsByCategory,
      recent_items: recentItems,
      low_stock_list: lowStockList,
    })
  } catch (error) {
    console.error("Stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
