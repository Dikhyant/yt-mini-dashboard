import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { logEvent } from "@/lib/logging"

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const body = await req.json()
  const note = await prisma.note.update({
    where: { id: params.id },
    data: { title: body.title, content: body.content, tags: body.tags },
  })
  await logEvent({ userId: (session.user as any).id, action: "notes.update", target: `note:${note.id}` })
  return NextResponse.json({ data: note })
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  await prisma.note.delete({ where: { id: params.id } })
  await logEvent({ userId: (session.user as any).id, action: "notes.delete", target: `note:${params.id}` })
  return NextResponse.json({ ok: true })
}
