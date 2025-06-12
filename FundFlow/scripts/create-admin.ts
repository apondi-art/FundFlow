import { supabase } from '../src/lib/supabase.js'
import bcrypt from 'bcryptjs'

async function createAdmin(email, password) {
  try {
    console.log('🔄 Creating admin user...')
    
    const password_hash = await bcrypt.hash(password, 10)
    
    const { data, error } = await supabase
      .from('admin_users')
      .insert([{ email, password_hash }])
      .select()

    if (error) throw error

    console.log('✅ Admin created successfully:', data)
    process.exit(0)
  } catch (error) {
    console.error('❌ Error creating admin:', error)
    process.exit(1)
  }
}

// Get command line arguments
const args = process.argv.slice(2)
const [email, password] = args

if (!email || !password) {
  console.error('❌ Usage: npm run create-admin -- <email> <password>')
  process.exit(1)
}

// Execute the function
createAdmin(email, password)