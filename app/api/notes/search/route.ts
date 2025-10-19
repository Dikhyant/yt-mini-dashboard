import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { logEvent } from "@/lib/logging"

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q")?.trim() || undefined
  const tag = searchParams.get("tag")?.trim() || undefined

  const where: any = { user: { email: session.user.email } }
  if (q) where.OR = [{ title: { contains: q, mode: "insensitive" } }, { content: { contains: q, mode: "insensitive" } }]
  if (tag) where.tags = { has: tag }

  const notes = await prisma.note.findMany({ where, orderBy: { updatedAt: "desc" }, take: 50 })
  await logEvent({ userId: (session.user as any).id, action: "notes.search", metadata: { q, tag, count: notes.length } })
  return NextResponse.json({ data: notes })
}
