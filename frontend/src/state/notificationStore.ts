import { create } from 'zustand'

export type NotificationType = 'info' | 'success' | 'warning' | 'error'

export interface Notification {
    id: string
    type: NotificationType
    message: string
    suggestion?: string
    dismissible: boolean
    duration?: number // Auto-dismiss after this many ms (0 = no auto-dismiss)
}

interface NotificationState {
    notifications: Notification[]

    // Actions
    addNotification: (notification: Omit<Notification, 'id'>) => void
    removeNotification: (id: string) => void
    clearAll: () => void
}

export const useNotificationStore = create<NotificationState>((set) => ({
    notifications: [],

    addNotification: (notification) => {
        const id = `notification-${Date.now()}-${Math.random()}`
        const newNotification: Notification = {
            ...notification,
            id,
        }

        set((state) => ({
            notifications: [...state.notifications, newNotification],
        }))

        // Auto-dismiss if duration is set
        if (notification.duration && notification.duration > 0) {
            setTimeout(() => {
                set((state) => ({
                    notifications: state.notifications.filter((n) => n.id !== id),
                }))
            }, notification.duration)
        }
    },

    removeNotification: (id) => {
        set((state) => ({
            notifications: state.notifications.filter((n) => n.id !== id),
        }))
    },

    clearAll: () => {
        set({ notifications: [] })
    },
}))
