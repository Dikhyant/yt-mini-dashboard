import { NextResponse } from "next/server"
import { fetchVideoDetails } from "@/lib/google"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { logEvent } from "@/lib/logging"

export async function GET(_: Request, { params }: { params: { videoId: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const data = await fetchVideoDetails(params.videoId)
    await logEvent({
      userId: (session.user as any).id,
      action: "video.fetch",
      target: `video:${params.videoId}`,
      metadata: { ok: true },
    })
    return NextResponse.json({ data })
  } catch (e: any) {
    await logEvent({
      userId: (session.user as any).id,
      action: "video.fetch",
      target: `video:${params.videoId}`,
      metadata: { error: String(e?.message || e) },
    })
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
  }
}
