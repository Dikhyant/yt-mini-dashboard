import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { logEvent } from "@/lib/logging"

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const url = new URL(req.url)
  const limit = Number(url.searchParams.get("limit") ?? 20)
  const notes = await prisma.note.findMany({
    where: { user: { email: session.user.email } },
    orderBy: { createdAt: "desc" },
    take: Math.min(100, limit),
  })
  await logEvent({ userId: (session.user as any).id, action: "notes.list" })
  return NextResponse.json({ data: notes })
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const body = await req.json()
  const note = await prisma.note.create({
    data: {
      title: body.title,
      content: body.content,
      tags: body.tags ?? [],
      user: { connect: { email: session.user.email } },
    },
  })
  await logEvent({ userId: (session.user as any).id, action: "notes.create", target: `note:${note.id}`, metadata: { tags: note.tags } })
  return NextResponse.json({ data: note })
}
