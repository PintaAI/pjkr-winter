import * as z from "zod"

export const LoginSchema = z.object({
  email: z.string().email({
    message: "Email tidak valid"
  }),
  password: z.string().min(1, {
    message: "Password harus diisi"
  })
})

export const RegisterSchema = z.object({
  email: z.string().email({
    message: "Email tidak valid"
  }),
  password: z.string().min(6, {
    message: "Password minimal 6 karakter"
  }),
  name: z.string().min(1, {
    message: "Nama harus diisi"
  })
})
