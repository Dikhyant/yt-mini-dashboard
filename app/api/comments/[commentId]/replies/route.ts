import { NextResponse } from "next/server"
import { replyToComment } from "@/lib/google"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { logEvent } from "@/lib/logging"

export async function POST(req: Request, { params }: { params: { commentId: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { text } = await req.json()
  try {
    const data = await replyToComment(params.commentId, text)
    await logEvent({
      userId: (session.user as any).id,
      action: "comment.reply",
      target: `comment:${params.commentId}`,
      metadata: { commentId: (data as any).id },
    })
    return NextResponse.json({ data })
  } catch (e: any) {
    await logEvent({
      userId: (session.user as any).id,
      action: "comment.reply",
      target: `comment:${params.commentId}`,
      metadata: { error: String(e?.message || e) },
    })
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
  }
}
