import { readFileSync } from 'fs'
import { execSync } from 'child_process'

// Read LOCAL_PORT from .env (handles Windows CRLF, quotes, spaces)
let port = 3000
try {
  const env = readFileSync('.env', 'utf8')
  for (const rawLine of env.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (line.startsWith('LOCAL_PORT')) {
      const value = line.split('=')[1]?.trim().replace(/^["']|["']$/g, '')
      if (value && /^\d+$/.test(value)) {
        port = Number(value)
      }
      break
    }
  }
} catch {
  // .env not found — use default port
}

const cmd = process.argv[2] || 'dev' // 'dev' or 'start'
console.log(`Starting next ${cmd} on port ${port}...`)

try {
  execSync(`npx next ${cmd} --port ${port}`, { stdio: 'inherit' })
} catch {
  process.exit(1)
}
