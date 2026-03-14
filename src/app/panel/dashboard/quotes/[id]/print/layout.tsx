// This layout overrides the parent dashboard layout so the print page
// renders as a clean standalone page (no sidebar / admin shell).
export default function PrintLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
