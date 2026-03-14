import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import WorkerDashboard from '@/components/worker/WorkerDashboard'

export default async function WorkerPage() {
  const session = await getSession()

  if (!session.isLoggedIn) {
    redirect('/panel')
  }

  if (session.role === 'ADMIN' || session.role === 'BOSS') {
    redirect('/panel/dashboard')
  }

  return (
    <WorkerDashboard
      user={{
        fullName: session.fullName || 'Worker',
        role: session.role || 'WORKER',
      }}
    />
  )
}
