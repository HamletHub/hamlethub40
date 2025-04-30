import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { getDatabase } from './mongodb';
import bcrypt from 'bcryptjs';
import { JWT } from 'next-auth/jwt';
import { Session } from 'next-auth';

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type Credentials = {
  email: string;
  password: string;
};

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials: Credentials | undefined) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const db = await getDatabase();
          const user = await db.collection('users').findOne({ 
            email: credentials.email.toLowerCase() 
          });

          if (!user) {
            return null;
          }

          // If using plain text passwords (for development only)
          if (credentials.password === user.password) {
            return {
              id: user._id.toString(),
              name: user.name || user.email,
              email: user.email,
              role: user.role || 'user',
            };
          }

          // If using hashed passwords (recommended for production)
          // Uncomment when needed:
          /*
          const isValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isValid) {
            return null;
          }
          */

          return {
            id: user._id.toString(),
            name: user.name || user.email,
            email: user.email,
            role: user.role || 'user',
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
};

// For use with getServerSession in server components
export default authOptions; 