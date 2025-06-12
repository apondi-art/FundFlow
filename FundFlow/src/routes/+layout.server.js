export const load = async ({ event, resolve }) => {
  const sessionCookie = event.cookies.get('admin-session')
  event.locals.session = sessionCookie ? JSON.parse(sessionCookie) : null
  return await resolve(event)
}