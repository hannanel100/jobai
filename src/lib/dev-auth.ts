// Development-only authentication bypass
// DO NOT USE IN PRODUCTION

import { auth } from '@/auth'

export async function getDevSession() {
  // In development, check if we should bypass auth
  if (process.env.NODE_ENV === 'development' && process.env.BYPASS_AUTH === 'true') {
    // Return a mock session for testing - using the actual dev user ID from database
    return {
      user: {
        id: 'cmbgy55ot0000oh9cqz2ktsjc',
        email: 'dev@test.com',
        firstName: 'Dev',
        lastName: 'User'
      }
    }
  }
  
  // Otherwise, use normal auth
  return auth()
}

export function isDevelopmentBypass() {
  return process.env.NODE_ENV === 'development' && process.env.BYPASS_AUTH === 'true'
}
