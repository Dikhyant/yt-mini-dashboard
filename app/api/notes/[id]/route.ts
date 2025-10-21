import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { logEvent } from "@/lib/logging"

type RouteParams = { id: string }

export async function PATCH(req: Request, context: { params: RouteParams | Promise<RouteParams> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } =
  context.params instanceof Promise
    ? await context.params
    : context.params
  const body = await req.json()
  const note = await prisma.note.update({
    where: { id },
    data: { title: body.title, content: body.content, tags: body.tags },
  })
  await logEvent({ userId: (session.user as any).id, action: "notes.update", target: `note:${note.id}` })
  return NextResponse.json({ data: note })
}

export async function DELETE(_: Request, context: { params: RouteParams | Promise<RouteParams> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } =
  context.params instanceof Promise
    ? await context.params
    : context.params
  await prisma.note.delete({ where: { id } })
  await logEvent({ userId: (session.user as any).id, action: "notes.delete", target: `note:${id}` })
  return NextResponse.json({ ok: true })
}
