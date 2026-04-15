import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const categories = await prisma.category.findMany({
      include: { _count: { select: { items: true } } },
      orderBy: { name: "asc" },
    })

    const result = categories.map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      item_count: c._count.items,
      created_at: c.createdAt.toISOString(),
      updated_at: c.updatedAt.toISOString(),
    }))

    return NextResponse.json(result)
  } catch (error) {
    console.error("Get categories error:", error)
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
    const { name, description } = data

    if (!name) {
      return NextResponse.json({ error: "Nama kategori wajib diisi" }, { status: 400 })
    }

    // Check if category already exists
    const existing = await prisma.category.findUnique({ where: { name } })
    if (existing) {
      return NextResponse.json({ error: "Kategori sudah ada" }, { status: 400 })
    }

    const category = await prisma.category.create({
      data: {
        name,
        description: description || null,
      },
    })

    return NextResponse.json({
      id: category.id,
      name: category.name,
      description: category.description,
      item_count: 0,
      created_at: category.createdAt.toISOString(),
      updated_at: category.updatedAt.toISOString(),
    })
  } catch (error) {
    console.error("Create category error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
