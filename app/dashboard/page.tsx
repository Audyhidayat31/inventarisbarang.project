import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { DashboardContent } from "@/components/dashboard/dashboard-content"

export default async function DashboardPage() {
  const user = await getSession()

  // Get stats using Prisma
  const totalItems = await prisma.item.count()
  const totalCategories = await prisma.category.count()

  // Get low stock items (stock <= 5 as threshold)
  const lowStockItems = await prisma.item.count({
    where: { stock: { lte: 5 } },
  })

  // Total value is not tracked in schema, default to 0
  const totalValue = 0

  // Items by category
  const categories = await prisma.category.findMany({
    include: { _count: { select: { items: true } } },
    orderBy: { name: "asc" },
  })
  const itemsByCategory = categories.map((c) => ({
    category: c.name,
    count: c._count.items,
  }))

  // Recent items
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

  // Low stock list
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

  const stats = {
    total_items: totalItems,
    total_categories: totalCategories,
    low_stock_items: lowStockItems,
    total_value: totalValue,
    items_by_category: itemsByCategory,
    recent_items: recentItems as any[],
    low_stock_list: lowStockList as any[],
  }

  return <DashboardContent user={user!} stats={stats} />
}
