import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { generateTodayWorkOrders } from '@/lib/generate-workorders'

export async function POST() {
  const session = await getSession()
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!['ADMIN', 'BOSS'].includes(session.role!)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const created = await generateTodayWorkOrders()
  return NextResponse.json({ created })
}
