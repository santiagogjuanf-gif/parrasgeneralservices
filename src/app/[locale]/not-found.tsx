import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="font-[family-name:var(--font-montserrat)] text-7xl font-bold text-[#0B7A3B]">
        404
      </h1>
      <h2 className="mt-4 font-[family-name:var(--font-montserrat)] text-2xl font-bold text-[#0F172A] md:text-3xl">
        Page Not Found
      </h2>
      <p className="mt-3 max-w-md text-[#334155]">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="mt-8 inline-block rounded-lg bg-[#0B7A3B] px-8 py-3 font-semibold text-white transition-colors hover:bg-[#096832]"
      >
        Go to Homepage
      </Link>
    </div>
  )
}
