// ViralReels - NextAuth.js v5 Configuration
// Last updated: 2026-01-19

import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import GoogleProvider from 'next-auth/providers/google';
import EmailProvider from 'next-auth/providers/email';
import { prisma } from './prisma';
import { Plan } from '@prisma/client';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM || 'noreply@viralreels.com',
    }),
  ],
  pages: {
    signIn: '/login',
    signOut: '/logout',
    error: '/auth/error',
    verifyRequest: '/auth/verify',
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;

        // Ajouter les informations de subscription
        const subscription = await prisma.subscription.findUnique({
          where: { userId: user.id },
        });

        session.user.plan = subscription?.plan || Plan.FREE;
        session.user.subscriptionStatus = subscription?.status;
      }

      return session;
    },
    async signIn({ user, account, profile }) {
      // Créer automatiquement une subscription FREE pour les nouveaux users
      if (user.id) {
        const existingSubscription = await prisma.subscription.findUnique({
          where: { userId: user.id },
        });

        if (!existingSubscription) {
          await prisma.subscription.create({
            data: {
              userId: user.id,
              plan: Plan.FREE,
              status: 'ACTIVE',
            },
          });
        }
      }

      return true;
    },
  },
  events: {
    async createUser({ user }) {
      console.log(`New user created: ${user.email}`);
    },
  },
  session: {
    strategy: 'database',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV === 'development',
};

// Extension du type Session pour TypeScript
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      plan: Plan;
      subscriptionStatus?: string;
    };
  }

  interface User {
    plan?: Plan;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    plan?: Plan;
  }
}
