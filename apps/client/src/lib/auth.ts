import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import DiscordProvider from "next-auth/providers/discord";
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
      businessId: string | null;
      role: string;
      onboardingCompleted: boolean;
    }
  }
  
  interface User {
    id: string;
    email: string;
    name?: string | null;
    businessId: string | null;
    role: string;
    onboardingCompleted: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    businessId: string | null;
    role: string;
    onboardingCompleted: boolean;
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

        if (!user) {
          return null;
        }

        // Users created via OAuth will have no password
        if (!user.password) {
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
          businessId: user.businessId || null,
          role: user.role,
          onboardingCompleted: user.onboardingCompleted || false,
        };
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID || "",
      clientSecret: process.env.DISCORD_CLIENT_SECRET || "",
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
        token.onboardingCompleted = user.onboardingCompleted;
      }
      
      // Always fetch fresh data from database to ensure we have the latest values
      if (token.sub) {
        try {
          const freshUser = await db.user.findUnique({
            where: { id: token.sub },
            select: {
              businessId: true,
              onboardingCompleted: true,
              role: true,
            }
          });
          
          if (freshUser) {
            token.businessId = freshUser.businessId;
            token.onboardingCompleted = freshUser.onboardingCompleted ?? false;
            token.role = freshUser.role;
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          // Continue with existing token data if database query fails
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.businessId = token.businessId;
        session.user.role = token.role;
        session.user.onboardingCompleted = token.onboardingCompleted;
        session.user.id = token.sub || '';
      }
      return session;
    }
  },
  pages: {
    signIn: "/signin",
  }
};
