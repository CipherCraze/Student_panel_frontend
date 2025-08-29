// Utility functions for testing multiple users

export const clearUserData = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  localStorage.removeItem('currentUserId')
  localStorage.removeItem('mockUsers')
  localStorage.removeItem('mockSchools')
  console.log('All user data cleared from localStorage')
}

export const getCurrentUserData = () => {
  const user = localStorage.getItem('user')
  const schools = localStorage.getItem('mockSchools')
  
  console.log('Current User:', user ? JSON.parse(user) : 'None')
  console.log('Available Schools:', schools ? JSON.parse(schools) : 'None')
  
  return {
    user: user ? JSON.parse(user) : null,
    schools: schools ? JSON.parse(schools) : []
  }
}

export const resetToDefaultData = () => {
  clearUserData()
  // Reload the page to reinitialize mock data
  window.location.reload()
}

export const showRegisteredUsers = () => {
  try {
    const storedUsers = localStorage.getItem('mockUsers')
    if (storedUsers) {
      const users = JSON.parse(storedUsers)
      console.log('Registered Users:')
      users.forEach((user: any) => {
        console.log(`- ${user.name} (${user.email}) - Password: ${user.password || 'password'}`)
      })
    } else {
      console.log('No registered users found')
    }
  } catch (error) {
    console.error('Error reading users:', error)
  }
}
