import { NextResponse } from "next/server"
import { fetchVideoDetails } from "@/lib/google"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { logEvent } from "@/lib/logging"

type RouteParams = { videoId: string }

export async function GET(_: Request, context: { params: RouteParams | Promise<RouteParams> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { videoId } =
  context.params instanceof Promise
    ? await context.params
    : context.params
  try {
    const data = await fetchVideoDetails(videoId)
    await logEvent({
      userId: (session.user as any).id,
      action: "video.fetch",
      target: `video:${videoId}`,
      metadata: { ok: true },
    })
    return NextResponse.json({ data })
  } catch (e: any) {
    await logEvent({
      userId: (session.user as any).id,
      action: "video.fetch",
      target: `video:${videoId}`,
      metadata: { error: String(e?.message || e) },
    })
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
  }
}
