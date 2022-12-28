import NextAuth, { DefaultSession, Session } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    accessToken: string;
    user: {
      name?: string | null;
      email?: string | null;
      id?: string
    } | undefined & DefaultSession['user']
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken: string;
    user: {
        name?: string | null;
        email?: string | null;
        id?: string
    } | undefined
  }
}