import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin | Parras General Services',
  robots: { index: false, follow: false },
}

export default function PanelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "'Inter', system-ui, sans-serif", backgroundColor: '#F8FAFC' }}>
        {children}
      </body>
    </html>
  )
}
