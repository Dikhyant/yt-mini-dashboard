import { NextResponse } from "next/server"
import { addTopLevelComment, deleteComment, fetchComments } from "@/lib/google"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { logEvent } from "@/lib/logging"

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { searchParams } = new URL(req.url);
  const videoId = searchParams.get("videoId") as string
  console.log({videoId})

  try {
    const data = await fetchComments(videoId)
    console.log({commentData: data})
    await logEvent({
      userId: (session.user as any).id,
      action: "comment.fetch",
      target: `video:${videoId}`,
      metadata: { threadId: (data as any).id },
    })
    return NextResponse.json({ data })
  } catch (e: any) {
    await logEvent({
      userId: (session.user as any).id,
      action: "comment.fetch",
      target: `video:${videoId}`,
      metadata: { error: String(e?.message || e) },
    })
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { videoId, text } = await req.json()

  try {
    const data = await addTopLevelComment(videoId, text)
    console.log({data})
    await logEvent({
      userId: (session.user as any).id,
      action: "comment.create",
      target: `video:${videoId}`,
      metadata: { threadId: (data as any).id },
    })
    return NextResponse.json({ data })
  } catch (e: any) {
    await logEvent({
      userId: (session.user as any).id,
      action: "comment.create",
      target: `video:${videoId}`,
      metadata: { error: String(e?.message || e) },
    })
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { commentId } = await req.json()
  try {
    await deleteComment(commentId);
    await logEvent({
      userId: (session.user as any).id,
      action: "comment.delete",
      target: `video:${commentId}`,
    })
  } catch(e: any) {
    await logEvent({
      userId: (session.user as any).id,
      action: "comment.delete",
      target: `commentId:${commentId}`,
      metadata: { error: String(e?.message || e) },
    })
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
  }
}