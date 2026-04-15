import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get total items count
    const totalItems = await prisma.item.count()

    // Get total categories count
    const totalCategories = await prisma.category.count()

    // Get low stock items count (stock <= 5)
    const lowStockItems = await prisma.item.count({
      where: { stock: { lte: 5 } },
    })

    // Total value (not tracked in schema)
    const totalValue = 0

    // Get items by category
    const categories = await prisma.category.findMany({
      include: { _count: { select: { items: true } } },
      orderBy: { name: "asc" },
    })
    const itemsByCategory = categories.map((c) => ({
      category: c.name,
      count: c._count.items,
    }))

    // Get recent items
    const recentItemsRaw = await prisma.item.findMany({
      include: { category: true, location: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    })
    const recentItems = recentItemsRaw.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      sku: item.sku,
      stock: item.stock,
      unit: item.unit,
      category_name: item.category.name,
      location_name: item.location?.name || null,
      created_at: item.createdAt.toISOString(),
      updated_at: item.updatedAt.toISOString(),
    }))

    // Get low stock items list
    const lowStockListRaw = await prisma.item.findMany({
      where: { stock: { lte: 5 } },
      include: { category: true, location: true },
      orderBy: { stock: "asc" },
      take: 10,
    })
    const lowStockList = lowStockListRaw.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      sku: item.sku,
      stock: item.stock,
      unit: item.unit,
      category_name: item.category.name,
      location_name: item.location?.name || null,
      created_at: item.createdAt.toISOString(),
      updated_at: item.updatedAt.toISOString(),
    }))

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
