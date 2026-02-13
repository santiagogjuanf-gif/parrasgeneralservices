import AdminDashboardShell from '@/components/admin/AdminDashboardShell'
import UsersTable from '@/components/admin/UsersTable'

export default function UsersPage() {
  return (
    <AdminDashboardShell>
      <UsersTable />
    </AdminDashboardShell>
  )
}
