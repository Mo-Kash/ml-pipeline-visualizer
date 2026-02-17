import { useNotificationStore, type Notification } from '../../state/notificationStore'
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react'
import { cn } from '../../lib/utils'

const NotificationList = () => {
    const { notifications, removeNotification } = useNotificationStore()

    if (notifications.length === 0) return null

    const getIcon = (type: Notification['type']) => {
        switch (type) {
            case 'success':
                return <CheckCircle className="w-5 h-5" />
            case 'error':
                return <AlertCircle className="w-5 h-5" />
            case 'warning':
                return <AlertTriangle className="w-5 h-5" />
            case 'info':
            default:
                return <Info className="w-5 h-5" />
        }
    }

    const getStyles = (type: Notification['type']) => {
        switch (type) {
            case 'success':
                return 'bg-green-900/90 border-green-700 text-green-100'
            case 'error':
                return 'bg-red-900/90 border-red-700 text-red-100'
            case 'warning':
                return 'bg-yellow-900/90 border-yellow-700 text-yellow-100'
            case 'info':
            default:
                return 'bg-blue-900/90 border-blue-700 text-blue-100'
        }
    }

    return (
        <div className="fixed top-20 right-6 z-50 flex flex-col gap-3 max-w-md">
            {notifications.map((notification) => (
                <div
                    key={notification.id}
                    className={cn(
                        'flex items-start gap-3 p-4 rounded-lg border-2 shadow-lg backdrop-blur-sm animate-in slide-in-from-right',
                        getStyles(notification.type)
                    )}
                >
                    <div className="flex-shrink-0 mt-0.5">
                        {getIcon(notification.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{notification.message}</p>
                        {notification.suggestion && (
                            <p className="text-xs mt-1 opacity-90">{notification.suggestion}</p>
                        )}
                    </div>

                    {notification.dismissible && (
                        <button
                            onClick={() => removeNotification(notification.id)}
                            className="flex-shrink-0 hover:opacity-70 transition-opacity"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            ))}
        </div>
    )
}

export default NotificationList
