import { z } from "zod"
import { UserRole, UserPlan } from "@prisma/client"

export const UserSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  email: z.string().email(),
  emailVerified: z.date().nullable(),
  image: z.string().nullable(),
  password: z.string().nullable(),
  role: z.nativeEnum(UserRole).default(UserRole.USER),
  plan: z.nativeEnum(UserPlan).default(UserPlan.FREE),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const LoginSchema = z.object({
  email: z.string().email({
    message: "Email tidak valid",
  }),
  password: z.string().min(6, {
    message: "Password minimal 6 karakter",
  }),
})

export const RegisterSchema = z.object({
  name: z.string().min(1, {
    message: "Nama harus diisi",
  }),
  email: z.string().email({
    message: "Email tidak valid",
  }),
  password: z.string().min(6, {
    message: "Password minimal 6 karakter",
  }),
})

export type LoginInput = z.infer<typeof LoginSchema>
export type RegisterInput = z.infer<typeof RegisterSchema>
export type User = z.infer<typeof UserSchema>
