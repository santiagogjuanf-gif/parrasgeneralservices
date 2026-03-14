export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const cron = await import('node-cron')
    const { generateTodayWorkOrders } = await import('@/lib/generate-workorders')

    // Generate work orders every day at 14:00 (2:00 PM)
    cron.schedule('0 14 * * *', async () => {
      try {
        const created = await generateTodayWorkOrders()
        console.log(`[cron] Work orders generated at 14:00: ${created} created`)
      } catch (err) {
        console.error('[cron] Failed to generate work orders:', err)
      }
    })

    console.log('[instrumentation] Work order cron job scheduled at 14:00 daily')
  }
}
