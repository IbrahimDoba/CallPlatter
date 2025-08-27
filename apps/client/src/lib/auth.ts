import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { db } from "@repo/db";
import bcrypt from "bcryptjs";

// Extend the built-in session types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      businessId: string;
      role: string;
    }
  }
  
  interface User {
    id: string;
    email: string;
    name?: string | null;
    businessId: string;
    role: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    businessId: string;
    role: string;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Look up user by email (not business)
        const user = await db.user.findUnique({
          where: {
            email: credentials.email
          },
          include: {
            business: true // Include business info
          }
        });

        if (!user || !user.businessId) {
          return null;
        }

        // Check password
        const isValidPassword = await bcrypt.compare(credentials.password, user.password);

        if (!isValidPassword) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          businessId: user.businessId,
          role: user.role,
        };
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.businessId = user.businessId;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.businessId = token.businessId;
        session.user.role = token.role;
        session.user.id = token.sub!;
      }
      return session;
    }
  },
  pages: {
    signIn: "/auth/signin",
  }
};
