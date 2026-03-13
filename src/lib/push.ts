import webpush from 'web-push'
import { prisma } from '@/lib/prisma'

if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY || !process.env.VAPID_EMAIL) {
  console.warn('[push] VAPID env vars not set. Push notifications will not work.')
}

webpush.setVapidDetails(
  `mailto:${process.env.VAPID_EMAIL || 'admin@example.com'}`,
  process.env.VAPID_PUBLIC_KEY || '',
  process.env.VAPID_PRIVATE_KEY || ''
)

export const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || ''

export async function sendPushToUser(
  userId: number,
  payload: { title: string; body: string; url?: string }
): Promise<void> {
  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId },
  })

  const payloadStr = JSON.stringify(payload)

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          payloadStr
        )
      } catch (err: unknown) {
        const error = err as { statusCode?: number }
        if (error?.statusCode === 410 || error?.statusCode === 404) {
          // Subscription expired or invalid — remove from DB
          await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {})
        } else {
          console.error('[push] Failed to send notification to subscription', sub.id, err)
        }
      }
    })
  )
}
