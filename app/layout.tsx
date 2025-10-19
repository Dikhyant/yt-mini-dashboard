import { getServerSession } from "next-auth";
import "./globals.css"
import { ReactNode } from "react"
import { authOptions } from "@/lib/auth";
import Signout from "./components/Signout";

export default async function RootLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  const isLoggedin = !!(session as any)?.accessToken
  return (
    <html lang="en">
      <body>
        <div className="container py-6 space-y-6">
          <header className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">YouTube Mini‑Dashboard</h1>
            {isLoggedin ? <Signout /> : <a className="btn" href="/api/auth/signin">Sign in with Google</a>}
          </header>
          {children}
          <footer className="text-sm opacity-70 py-6">Built with Next.js • YouTube Data API</footer>
        </div>
      </body>
    </html>
  )
}
