import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'

export interface SessionData {
  userId?: number
  username?: string
  fullName?: string
  role?: string
  isLoggedIn?: boolean
}

export async function getSession() {
  const cookieStore = await cookies()
  return getIronSession<SessionData>(cookieStore, {
    password: process.env.SESSION_SECRET || 'complex_password_at_least_32_characters_long_here',
    cookieName: 'pgs-session',
    cookieOptions: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'lax',
    },
  })
}
