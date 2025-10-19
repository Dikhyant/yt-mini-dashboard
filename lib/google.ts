import { google } from "googleapis"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function getYouTubeClient() {
  const session = await getServerSession(authOptions)
  if (!session) throw new Error("Unauthenticated")

  const accessToken = (session as any).accessToken as string
  const auth = new google.auth.OAuth2()
  auth.setCredentials({ access_token: accessToken })
  return google.youtube({ version: "v3", auth })
}

export async function fetchVideoDetails(videoId: string) {
  const yt = await getYouTubeClient()
  const res = await yt.videos.list({
    part: ["snippet", "statistics", "status"],
    id: [videoId],
  })
  const item = res.data.items?.[0]
  if (!item) throw new Error("Video not found")
  return item
}

export async function updateVideo(videoId: string, data: { title?: string; description?: string }) {
  const yt = await getYouTubeClient()
  const res = await yt.videos.update({
    part: ["snippet"],
    requestBody: {
      id: videoId,
      snippet: {
        title: data.title,
        description: data.description,
        categoryId: "22",
      },
    },
  })
  return res.data
}

export async function fetchComments(videoId: string) {
  const yt = await getYouTubeClient()
  const res = await yt.commentThreads.list({
    part: ["snippet", "replies"],
    videoId
  })

  console.log({commentRes: res})

  return res.data
}

export async function addTopLevelComment(videoId: string, text: string) {
  const yt = await getYouTubeClient()
  const res = await yt.commentThreads.insert({
    part: ["snippet"],
    requestBody: {
      snippet: {
        videoId,
        topLevelComment: { snippet: { textOriginal: text } },
      },
    },
  })

  return res.data
}

export async function replyToComment(commentId: string, text: string) {
  const yt = await getYouTubeClient()
  const res = await yt.comments.insert({
    part: ["snippet"],
    requestBody: { snippet: { parentId: commentId, textOriginal: text } },
  })
  return res.data
}

export async function deleteComment(commentId: string) {
  const yt = await getYouTubeClient()
  await yt.comments.delete({ id: commentId })
}
