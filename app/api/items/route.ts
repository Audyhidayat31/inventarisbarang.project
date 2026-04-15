import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const category = searchParams.get("category") || ""

    const where: any = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
      ]
    }

    if (category) {
      where.categoryId = category
    }

    const items = await prisma.item.findMany({
      where,
      include: { category: true, location: true },
      orderBy: { createdAt: "desc" },
    })

    const result = items.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      sku: item.sku,
      stock: item.stock,
      unit: item.unit,
      categoryId: item.categoryId,
      category_name: item.category.name,
      locationId: item.locationId,
      location_name: item.location?.name || null,
      created_at: item.createdAt.toISOString(),
      updated_at: item.updatedAt.toISOString(),
    }))

    return NextResponse.json(result)
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
    const { name, description, sku, categoryId, stock, unit, locationId } = data

    if (!name || !categoryId || stock === undefined || !unit || !sku) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 })
    }

    // Check if SKU already exists
    const existingSku = await prisma.item.findUnique({ where: { sku } })
    if (existingSku) {
      return NextResponse.json({ error: "SKU sudah digunakan" }, { status: 400 })
    }

    const item = await prisma.item.create({
      data: {
        name,
        description: description || null,
        sku,
        categoryId,
        stock: parseInt(stock),
        unit,
        locationId: locationId || null,
      },
      include: { category: true, location: true },
    })

    return NextResponse.json({
      id: item.id,
      name: item.name,
      description: item.description,
      sku: item.sku,
      stock: item.stock,
      unit: item.unit,
      categoryId: item.categoryId,
      category_name: item.category.name,
      locationId: item.locationId,
      location_name: item.location?.name || null,
      created_at: item.createdAt.toISOString(),
      updated_at: item.updatedAt.toISOString(),
    })
  } catch (error) {
    console.error("Create item error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
