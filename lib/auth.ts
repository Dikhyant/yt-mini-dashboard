import { type NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: [
            "openid",
            "email",
            "profile",
            "https://www.googleapis.com/auth/youtube.readonly",
            "https://www.googleapis.com/auth/youtube.force-ssl",
          ].join(" "),
          access_type: "offline",
          prompt: "consent",
        },
      },
    } as any),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        (token as any).accessToken = account.access_token
        ;(token as any).refreshToken = account.refresh_token
      }
      return token
    },
    async session({ session, token }) {
      ;(session as any).accessToken = (token as any).accessToken
      ;(session as any).refreshToken = (token as any).refreshToken
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}
