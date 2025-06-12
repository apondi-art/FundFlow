import { supabase } from './supabase'
import bcrypt from 'bcryptjs'

export async function loginAdmin(email: string, password: string) {
  const { data, error } = await supabase
    .from('admin_users')  // Changed from 'admins' to 'admin_users'
    .select('*')
    .eq('email', email)
    .single()

  if (error || !data) return null

  // Compare hashed password
  const isValid = await bcrypt.compare(password, data.password_hash)
  if (!isValid) return null

  // If password is correct, return session info
  return {
    id: data.id,
    email: data.email,
    admin: true
  }
}

export function isAuthenticated(session: unknown) {
  return !!session && typeof session === 'object' &&
         'admin' in session && session.admin === true
}