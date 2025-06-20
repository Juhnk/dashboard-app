import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'editor' | 'viewer'
  organizationId: string
  organization: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  setUser: (user: User | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  devtools(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => 
        set({ user, isAuthenticated: !!user }, false, 'setUser'),
      logout: () => 
        set({ user: null, isAuthenticated: false }, false, 'logout'),
    }),
    { name: 'auth-store' }
  )
)