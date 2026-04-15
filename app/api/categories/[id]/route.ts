import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

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
    const existing = await prisma.category.findFirst({
      where: { name, NOT: { id } },
    })
    if (existing) {
      return NextResponse.json({ error: "Kategori dengan nama ini sudah ada" }, { status: 400 })
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        description: description || null,
      },
    })

    return NextResponse.json({
      id: category.id,
      name: category.name,
      description: category.description,
      created_at: category.createdAt.toISOString(),
      updated_at: category.updatedAt.toISOString(),
    })
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
    const itemsCount = await prisma.item.count({
      where: { categoryId: id },
    })
    if (itemsCount > 0) {
      return NextResponse.json({ error: "Tidak dapat menghapus kategori yang memiliki barang" }, { status: 400 })
    }

    await prisma.category.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete category error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
