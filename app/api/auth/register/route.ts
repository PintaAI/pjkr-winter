import { db } from "@/lib/db"
import { RegisterSchema } from "@/schemas"
import { UserRole, UserPlan } from "@prisma/client"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const validatedFields = RegisterSchema.safeParse(body)

    if (!validatedFields.success) {
      return NextResponse.json(
        { error: "Data tidak valid" },
        { status: 400 }
      )
    }

    const { email, password, name } = validatedFields.data
    
    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Email sudah terdaftar" },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: UserRole.USER,
        plan: UserPlan.FREE
      }
    })

    return NextResponse.json(
      { success: "User berhasil didaftarkan" },
      { status: 201 }
    )
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Terjadi kesalahan internal" },
      { status: 500 }
    )
  }
}
