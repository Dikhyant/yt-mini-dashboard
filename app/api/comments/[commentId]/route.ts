import { NextResponse } from "next/server"
import { deleteComment } from "@/lib/google"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { logEvent } from "@/lib/logging"

type RouteParams = { commentId: string }

export async function DELETE(_: Request, context: { params: RouteParams | Promise<RouteParams> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { commentId } =
  context.params instanceof Promise
    ? await context.params
    : context.params
  try {
    await deleteComment(commentId)
    await logEvent({ userId: (session.user as any).id, action: "comment.delete", target: `comment:${commentId}` })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    await logEvent({
      userId: (session.user as any).id,
      action: "comment.delete",
      target: `comment:${commentId}`,
      metadata: { error: String(e?.message || e) },
    })
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
  }
}
