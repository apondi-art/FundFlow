import { json, redirect } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { loginAdmin } from '$lib/auth'

export const POST: RequestHandler = async ({ request, cookies }) => {
  const { email, password } = await request.json()
  
  const session = await loginAdmin(email, password)
  if (!session) {
    return json({ message: 'Invalid credentials' }, { status: 401 })
  }

  // Set session cookie
  cookies.set('admin-session', JSON.stringify(session), {
    path: '/admin',
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 // 1 day
  })

  return json(session)
}