import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
    email: string
    id: string
}

interface AuthState {
    user: User | null
    isAuthenticated: boolean

    // Actions
    login: (email: string, password: string) => Promise<boolean>
    signup: (email: string, password: string) => Promise<boolean>
    logout: () => void
    checkAuth: () => void
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            isAuthenticated: false,

            login: async (email, password) => {
                // Simple client-side auth (NOT SECURE - for prototype only)
                const users = JSON.parse(localStorage.getItem('ml-viz-users') || '[]')
                const user = users.find((u: any) => u.email === email && u.password === password)

                if (user) {
                    set({
                        user: { email: user.email, id: user.id },
                        isAuthenticated: true,
                    })
                    return true
                }
                return false
            },

            signup: async (email, password) => {
                // Simple client-side auth (NOT SECURE - for prototype only)
                const users = JSON.parse(localStorage.getItem('ml-viz-users') || '[]')

                // Check if user already exists
                if (users.find((u: any) => u.email === email)) {
                    return false
                }

                const newUser = {
                    id: Date.now().toString(),
                    email,
                    password, // In production, this should be hashed
                }

                users.push(newUser)
                localStorage.setItem('ml-viz-users', JSON.stringify(users))

                set({
                    user: { email: newUser.email, id: newUser.id },
                    isAuthenticated: true,
                })
                return true
            },

            logout: () => {
                set({
                    user: null,
                    isAuthenticated: false,
                })
            },

            checkAuth: () => {
                const state = get()
                if (!state.user) {
                    set({ isAuthenticated: false })
                }
            },
        }),
        {
            name: 'ml-viz-auth',
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
)
