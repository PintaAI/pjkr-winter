import { UserRole, UserPlan } from "@prisma/client"
import NextAuth from "next-auth"

declare module "next-auth" {
  interface User {
    role?: UserRole
    plan?: UserPlan
  }
  
  interface Session {
    user: User & {
      id: string
      role?: UserRole
      plan?: UserPlan
    }
  }

  interface JWT {
    role?: UserRole
    plan?: UserPlan
  }
}
