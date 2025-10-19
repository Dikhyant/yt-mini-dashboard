import { NextResponse } from "next/server"
import { deleteComment } from "@/lib/google"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { logEvent } from "@/lib/logging"

export async function DELETE(_: Request, { params }: { params: { commentId: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    await deleteComment(params.commentId)
    await logEvent({ userId: (session.user as any).id, action: "comment.delete", target: `comment:${params.commentId}` })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    await logEvent({
      userId: (session.user as any).id,
      action: "comment.delete",
      target: `comment:${params.commentId}`,
      metadata: { error: String(e?.message || e) },
    })
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
  }
}
