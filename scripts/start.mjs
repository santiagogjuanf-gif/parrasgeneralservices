import { readFileSync } from 'fs'
import { execSync } from 'child_process'

// Read LOCAL_PORT from .env (no extra dependencies needed)
let port = 3000
try {
  const env = readFileSync('.env', 'utf8')
  const match = env.match(/^LOCAL_PORT=(\d+)/m)
  if (match) port = Number(match[1])
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
