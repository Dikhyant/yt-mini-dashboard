import { NextResponse } from "next/server"
import { updateVideo, fetchVideoDetails } from "@/lib/google"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { logEvent } from "@/lib/logging"

type RouteParams = { videoId: string }

export async function PATCH(req: Request, context: { params: RouteParams | Promise<RouteParams> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { videoId } =
  context.params instanceof Promise
    ? await context.params
    : context.params
  const body = await req.json()

  const existing = await fetchVideoDetails(videoId)
  const title = body.title ?? existing.snippet?.title
  const description = body.description ?? existing.snippet?.description

  try {
    const data = await updateVideo(videoId, { title, description })
    await logEvent({
      userId: (session.user as any).id,
      action: "video.update",
      target: `video:${videoId}`,
      metadata: { titleUpdated: !!body.title, descriptionUpdated: !!body.description },
    })
    return NextResponse.json({ data })
  } catch (e: any) {
    await logEvent({
      userId: (session.user as any).id,
      action: "video.update",
      target: `video:${videoId}`,
      metadata: { error: String(e?.message || e) },
    })
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
  }
}
