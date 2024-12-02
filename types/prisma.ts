import { Prisma, UserRole, UserPlan } from "@prisma/client"

// User types
export type UserType = Prisma.UserGetPayload<{}>
export type UserCreateInput = Prisma.UserCreateInput
export type UserUpdateInput = Prisma.UserUpdateInput
export type UserWhereInput = Prisma.UserWhereInput
export type UserWhereUniqueInput = Prisma.UserWhereUniqueInput

// Account types
export type AccountType = Prisma.AccountGetPayload<{}>
export type AccountCreateInput = Prisma.AccountCreateInput
export type AccountUpdateInput = Prisma.AccountUpdateInput

// Session types
export type SessionType = Prisma.SessionGetPayload<{}>
export type SessionCreateInput = Prisma.SessionCreateInput
export type SessionUpdateInput = Prisma.SessionUpdateInput

// VerificationToken types
export type VerificationTokenType = Prisma.VerificationTokenGetPayload<{}>
export type VerificationTokenCreateInput = Prisma.VerificationTokenCreateInput

// Enums
export { UserRole, UserPlan }
