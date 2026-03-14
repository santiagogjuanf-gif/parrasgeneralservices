// Route group layout — no AdminDashboardShell, just the HTML wrapper from panel/layout.tsx
export default function PrintGroupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
