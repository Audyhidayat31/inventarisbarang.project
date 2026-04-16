import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { hashPassword } from "@/lib/auth"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params;
    const body = await request.json()
    const { name, email, password, role } = body

    if (!name || !email || !role) {
      return NextResponse.json({ error: "Kolom nama, email, dan role tidak boleh kosong" }, { status: 400 })
    }

    // Check if email is used by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        id: { not: id },
      },
    })

    if (existingUser) {
      return NextResponse.json({ error: "Email sudah digunakan oleh pengguna lain" }, { status: 400 })
    }

    const updateData: any = {
      name,
      email,
      role,
    }

    if (password) {
      updateData.password = await hashPassword(password)
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        role: true,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("PUT /api/users/[id] error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params;

    // Prevent deleting oneself
    if (session.id === id) {
      return NextResponse.json({ error: "Tidak dapat menghapus akun sendiri" }, { status: 400 })
    }

    await prisma.user.delete({
      where: { id },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("DELETE /api/users/[id] error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
