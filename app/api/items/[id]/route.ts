import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

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

    const item = await prisma.item.findUnique({
      where: { id },
      include: { category: true, location: true },
    })

    if (!item) {
      return NextResponse.json({ error: "Item tidak ditemukan" }, { status: 404 })
    }

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
    const { name, description, sku, categoryId, stock, unit, locationId } = data

    if (!name || !categoryId || stock === undefined || !unit) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 })
    }

    // Check if item exists
    const existing = await prisma.item.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: "Item tidak ditemukan" }, { status: 404 })
    }

    // Check if SKU is used by another item
    if (sku && sku !== existing.sku) {
      const skuExists = await prisma.item.findUnique({ where: { sku } })
      if (skuExists) {
        return NextResponse.json({ error: "SKU sudah digunakan" }, { status: 400 })
      }
    }

    const item = await prisma.item.update({
      where: { id },
      data: {
        name,
        description: description || null,
        sku: sku || existing.sku,
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

    const existing = await prisma.item.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: "Item tidak ditemukan" }, { status: 404 })
    }

    await prisma.item.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete item error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
