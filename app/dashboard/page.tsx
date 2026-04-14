import { getSession } from "@/lib/auth"
import { sql } from "@/lib/db"
import { DashboardContent } from "@/components/dashboard/dashboard-content"

export default async function DashboardPage() {
  const user = await getSession()

  // Get stats
  const totalItemsResult = await sql`SELECT COUNT(*) as count FROM items`
  const totalItems = parseInt(totalItemsResult[0].count)

  const totalCategoriesResult = await sql`SELECT COUNT(*) as count FROM categories`
  const totalCategories = parseInt(totalCategoriesResult[0].count)

  const lowStockResult = await sql`SELECT COUNT(*) as count FROM items WHERE quantity <= min_stock`
  const lowStockItems = parseInt(lowStockResult[0].count)

  const totalValueResult = await sql`SELECT COALESCE(SUM(quantity * purchase_price), 0) as total FROM items`
  const totalValue = parseFloat(totalValueResult[0].total)

  const itemsByCategory = await sql`
    SELECT c.name as category, COUNT(i.id) as count
    FROM categories c
    LEFT JOIN items i ON c.id = i.category_id
    GROUP BY c.id, c.name
    ORDER BY count DESC
  `

  const recentItems = await sql`
    SELECT i.*, c.name as category_name
    FROM items i
    LEFT JOIN categories c ON i.category_id = c.id
    ORDER BY i.created_at DESC
    LIMIT 5
  `

  const lowStockList = await sql`
    SELECT i.*, c.name as category_name
    FROM items i
    LEFT JOIN categories c ON i.category_id = c.id
    WHERE i.quantity <= i.min_stock
    ORDER BY i.quantity ASC
    LIMIT 10
  `

  const stats = {
    total_items: totalItems,
    total_categories: totalCategories,
    low_stock_items: lowStockItems,
    total_value: totalValue,
    items_by_category: itemsByCategory as { category: string; count: number }[],
    recent_items: recentItems as any[],
    low_stock_list: lowStockList as any[],
  }

  return <DashboardContent user={user!} stats={stats} />
}
