import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join, extname, normalize } from 'path'
import { existsSync } from 'fs'

const MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.heic': 'image/heic',
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params

  // Only allow access to uploads directory
  if (!segments || segments.length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Prevent path traversal attacks
  const joined = segments.join('/')
  if (joined.includes('..')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const filePath = normalize(join(process.cwd(), 'public', 'uploads', joined))
  const uploadsBase = normalize(join(process.cwd(), 'public', 'uploads'))

  // Ensure the resolved path is still inside the uploads directory
  if (!filePath.startsWith(uploadsBase)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (!existsSync(filePath)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const ext = extname(filePath).toLowerCase()
  const contentType = MIME[ext] || 'application/octet-stream'

  const buffer = await readFile(filePath)
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
