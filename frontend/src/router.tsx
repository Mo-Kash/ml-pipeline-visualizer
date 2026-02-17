import { createBrowserRouter, Navigate } from 'react-router-dom'
import { useAuthStore } from './state/authStore'
import Home from './pages/Home'
import PipelineBuilder from './pages/PipelineBuilder'

// Protected Route wrapper component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

    if (!isAuthenticated) {
        return <Navigate to="/" replace />
    }

    return <>{children}</>
}

export const router = createBrowserRouter([
    {
        path: '/',
        element: <Home />,
    },
    {
        path: '/builder/:projectId',
        element: (
            <ProtectedRoute>
                <PipelineBuilder />
            </ProtectedRoute>
        ),
    },
    {
        path: '*',
        element: <Navigate to="/" replace />,
    },
])
