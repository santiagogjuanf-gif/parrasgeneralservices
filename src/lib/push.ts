import webpush from 'web-push'
import { prisma } from '@/lib/prisma'

export const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || ''

function initVapid() {
  const pub = process.env.VAPID_PUBLIC_KEY
  const priv = process.env.VAPID_PRIVATE_KEY
  const email = process.env.VAPID_EMAIL
  if (!pub || !priv || !email) {
    console.warn('[push] VAPID env vars not set. Push notifications disabled.')
    return false
  }
  webpush.setVapidDetails(`mailto:${email}`, pub, priv)
  return true
}

export async function sendPushToUser(
  userId: number,
  payload: { title: string; body: string; url?: string }
): Promise<void> {
  if (!initVapid()) return

  const subscriptions = await prisma.pushSubscription.findMany({ where: { userId } })
  const payloadStr = JSON.stringify(payload)

  await Promise.all(
    subscriptions.map(async (sub: { id: number; endpoint: string; p256dh: string; auth: string }) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payloadStr
        )
      } catch (err: unknown) {
        const error = err as { statusCode?: number }
        if (error?.statusCode === 410 || error?.statusCode === 404) {
          await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {})
        }
      }
    })
  )
}
