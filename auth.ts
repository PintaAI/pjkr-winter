import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { db } from "./lib/db"
import authConfig from "./auth.config"

import { UserRole, UserPlan } from "@prisma/client"
import { getUserById } from "./data/user"

 
export const { auth, handlers, signIn, signOut } = NextAuth({
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
    signOut: "/auth/signout",
  },
  events: {
    async linkAccount({user}) {
      await db.user.update({
        where: {id: user.id},
        data: {emailVerified: new Date()}
      })
    }
  },
  callbacks: {
   async session({session,token}){
    if (session.user && token.sub) {
      session.user.id = token.sub;
    }

    session.user.plan = UserPlan.PRO;

    if (token.role && session.user) {
      session.user.role = token.role as UserRole;
    }

    return session
   },
   async jwt({token}){
    if (!token.sub) return token;
  
    const existingUser = await getUserById(token.sub);

    if (existingUser) {
      token.role = existingUser.role;
      token.plan = existingUser.plan;
    }

    return token
   }
  },
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  ...authConfig,
})
