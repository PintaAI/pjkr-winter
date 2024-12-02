import { db } from "@/lib/db"
import { hash } from "bcryptjs"
import { NextResponse } from "next/server"
import { RegisterSchema } from "@/schemas"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const validatedFields = RegisterSchema.safeParse(body)

    if (!validatedFields.success) {
      return NextResponse.json({ error: "Data tidak valid" }, { status: 400 })
    }

    const { email, password, name, isPanitia } = body

    // Check if email already exists
    const existingUser = await db.user.findUnique({
      where: {
        email
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Email sudah terdaftar" },
        { status: 400 }
      )
    }

    const hashedPassword = await hash(password, 10)

    await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        isPanitia: isPanitia || false, // Default false jika tidak diset
        role: isPanitia ? "ADMIN" : "USER" // Set role berdasarkan isPanitia
      }
    })

    return NextResponse.json(
      { success: "Akun berhasil dibuat" },
      { status: 201 }
    )
  } catch (error) {
    console.error("ERROR REGISTER:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan saat membuat akun" },
      { status: 500 }
    )
  }
}
