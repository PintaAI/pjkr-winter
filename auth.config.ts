import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Apple from "next-auth/providers/apple";
import type { NextAuthConfig } from "next-auth";
import { LoginSchema } from "./schemas";

import bcrypt from "bcryptjs";
import { getUserByEmail } from "./data/user";

// Notice this is only an object, not a full Auth.js instance
export default {
  providers: [
    Google({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      clientSecret: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET!,
    }),
    Apple,
    Credentials({
      async authorize(credentials) {
        const validatedFields = LoginSchema.safeParse(credentials);

        if (validatedFields.success) {
          const { email, password } = validatedFields.data;
          const user = await getUserByEmail(email);
          if (!user || !user.password) return null;
          
          console.log("Comparing passwords");
          const passwordMatch = await bcrypt.compare(password, user.password);
          console.log(`Password match result: ${passwordMatch}`);

          if (passwordMatch) {
            return user;
          }
        }
        return null;
      }
    })
  ],
} satisfies NextAuthConfig