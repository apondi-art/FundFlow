import { redirect } from '@sveltejs/kit'
import type { LayoutServerLoad } from './$types'
import { isAuthenticated } from '$lib/auth'

export const load: LayoutServerLoad = async ({ cookies, url, locals }) => {
  const sessionCookie = cookies.get('admin-session')
  const isLoginPage = url.pathname === '/admin/login'

  try {
    const session = sessionCookie ? JSON.parse(sessionCookie) : null
    
    // Verify session is valid
    if (!isAuthenticated(session)) {
      throw new Error('Invalid session')
    }

    locals.session = session

    if (!session && !isLoginPage) {
      throw redirect(303, '/admin/login')
    }

    if (session && isLoginPage) {
      throw redirect(303, '/admin/dashboard')
    }

    return { session }
  } catch {
    cookies.delete('admin-session', { path: '/' })

    if (!isLoginPage) {
      throw redirect(303, '/admin/login')
    }

    return { session: null }
  }
}