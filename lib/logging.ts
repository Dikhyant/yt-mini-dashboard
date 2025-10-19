import { prisma } from "@/lib/prisma"

export async function logEvent(params: {
  userId?: string
  action: string
  target?: string
  metadata?: any
}) {
  try {
    await prisma.eventLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        target: params.target,
        metadata: params.metadata ?? {},
      },
    })
  } catch {
    // ignore
  }
}
