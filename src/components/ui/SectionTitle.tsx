interface SectionTitleProps {
  title: string
  subtitle?: string
  /** Center-align the title block (default: true) */
  centered?: boolean
}

export default function SectionTitle({
  title,
  subtitle,
  centered = true,
}: SectionTitleProps) {
  return (
    <div className={centered ? 'text-center' : ''}>
      <h2
        className="text-3xl font-bold tracking-tight md:text-4xl"
        style={{
          color: '#0F172A',
          fontFamily: "'Montserrat', sans-serif",
        }}
      >
        {title}
      </h2>

      {/* Gold underline decoration */}
      <div
        className={`mt-3 h-1 w-12 rounded-full ${centered ? 'mx-auto' : ''}`}
        style={{ backgroundColor: '#D4A11E' }}
      />

      {subtitle && (
        <p
          className="mt-4 text-base leading-relaxed md:text-lg"
          style={{
            color: '#334155',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  )
}
