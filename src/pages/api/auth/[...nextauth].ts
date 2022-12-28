/* eslint-disable */
import NextAuth, { type NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "../../../server/prisma";
import Credentials from "next-auth/providers/credentials";

// import { env } from "../../../env/server.mjs";

export const authOptions: NextAuthOptions = {
  // adapter: PrismaAdapter(prisma),
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID ?? '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? '',
    }),
    Credentials({
      name: 'Credentials',
      type: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'user@email.com' },
        name: { label: 'Name', type: 'text', placeholder: 'kev' },
        password: { label: 'Password', type: 'password', placeholder: 'Password' },
      },
      async authorize(credentials) {
        if(!credentials) throw new Error('Credentials required');
        const user_authed = await prisma.user.findUnique({
          where: {
            email: credentials.email
          },
          select: {
            id: true, email: true, name: true, password: true,
          }
        });

        if(!user_authed) {
          const user = await prisma.user.create({
            data: {
              email: credentials.email, name: credentials.name, password: credentials.password
            },
            select: {
              id: true, email: true, name: true,
            }
          });

          return user;
        }
        if(user_authed.password !== credentials?.password) throw new Error('Wrong credentials!')
        return { id: user_authed.id, email: user_authed.email, name: user_authed.name };
      }
    })
  ],
  callbacks: {
    jwt({ token, ...rest }) {
      console.log({JWT: { token, user: rest.user, userToken: token.user }})
      if(rest.user) {
        console.log({ areUser: rest.user })
      token.user = rest.user
      }
      return token;
    },
    session({ session, token, user }) {
      session.user = token.user;
      console.log({Session: { session, token, user }});
      return session;
    },
  },
  pages: {
    signIn: '/auth/login'
  },
  session: {
    strategy: 'jwt',
  },
  secret: 'secret'
};

export default NextAuth(authOptions);
