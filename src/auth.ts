// src/auth.ts
import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

import { db } from '@/lib/db';
import { LoginSchema } from '@/schemas/auth';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: 'jwt' }, // Using JWT for session strategy
  secret: process.env.NEXTAUTH_SECRET, // Already set in .env
  pages: {
    signIn: '/login', // Redirect to /login if sign in is required
    // error: "/auth/error", // Optional: custom error page
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        const validatedFields = LoginSchema.safeParse(credentials);

        if (validatedFields.success) {
          const { email, password } = validatedFields.data;

          const user = await db.user.findUnique({
            where: { email },
          });

          // If user not found or no password (e.g., OAuth user), deny access
          if (!user || !user.password) return null;

          const passwordsMatch = await bcrypt.compare(password, user.password);

          if (passwordsMatch) return user;
        }
        return null; // Return null if validation fails or credentials don't match
      },
    }),
    // TODO: Add other providers like Google, GitHub etc. later if needed
  ],
  callbacks: {
    // Use JWT to store session information
    async jwt({ token, user }) {
      if (user && user.id) {
        token.id = user.id;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        // token.role = user.role; // Example: if you add a role to your User model
      }
      return token;
    },
    // Attach JWT token data to the session object for client-side access
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        session.user.firstName = token.firstName as string;
        session.user.lastName = token.lastName as string;
        // session.user.role = token.role; // Example
      }
      return session;
    },
  },
  // Optional: events for logging, etc.
  // events: {
  //   async signIn(message) { /* on successful sign in */ },
  //   async signOut(message) { /* on sign out */ },
  // },
  // Optional: debug mode
  // debug: process.env.NODE_ENV === "development",
});
