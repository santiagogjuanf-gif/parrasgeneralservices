import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function saveUpload(file: File, subdir: string): Promise<{ filename: string; path: string }> {
  const uploadDir = join(process.cwd(), 'public', 'uploads', subdir)
  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true })
  }
  const ext = file.name.split('.').pop() || 'jpg'
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const filepath = join(uploadDir, filename)
  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(filepath, buffer)
  return { filename, path: `/api/uploads/${subdir}/${filename}` }
}
