import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import bcrypt from 'bcryptjs'
import { readFileSync } from 'fs'
import { createInterface } from 'readline'

// Read DATABASE_URL from .env
let dbUrl = 'file:./prisma/dev.db'
try {
  const env = readFileSync('.env', 'utf8')
  const match = env.match(/^DATABASE_URL="?([^"\n]+)"?/m)
  if (match) dbUrl = match[1]
} catch { /* use default */ }

const adapter = new PrismaBetterSqlite3({ url: dbUrl })
const prisma = new PrismaClient({ adapter })

const rl = createInterface({ input: process.stdin, output: process.stdout })
const ask = (q) => new Promise((res) => rl.question(q, res))

async function main() {
  console.log('\n=== Create Admin User ===\n')

  const fullName = await ask('Full name: ')
  const username = await ask('Username: ')
  const password = await ask('Password: ')

  if (!fullName || !username || !password) {
    console.error('All fields are required.')
    process.exit(1)
  }

  const passwordHash = await bcrypt.hash(password, 12)

  const user = await prisma.user.upsert({
    where: { username },
    update: { passwordHash, fullName, role: 'ADMIN' },
    create: { username, passwordHash, fullName, role: 'ADMIN' },
  })

  console.log(`\nAdmin user created successfully!`)
  console.log(`  ID:       ${user.id}`)
  console.log(`  Name:     ${user.fullName}`)
  console.log(`  Username: ${user.username}`)
  console.log(`  Role:     ${user.role}\n`)
}

main()
  .catch((e) => {
    console.error('Error:', e.message)
    process.exit(1)
  })
  .finally(async () => {
    rl.close()
    await prisma.$disconnect()
  })
