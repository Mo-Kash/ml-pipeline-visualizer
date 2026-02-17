
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../state/authStore'
import { useProjectStore } from '../../state/projectStore'
import { usePipelineStore } from '../../state/pipelineStore'
import { Button } from '../ui/Button'
import { LogOut, Save, FolderOpen, FilePlus, Download } from 'lucide-react'

const Header = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const currentProject = useProjectStore((state) => state.currentProject)
  const updateProject = useProjectStore((state) => state.updateProject)
  const nodes = usePipelineStore((state) => state.nodes)
  const edges = usePipelineStore((state) => state.edges)

  const isBuilderPage = location.pathname.startsWith('/builder')

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleSave = () => {
    if (currentProject) {
      updateProject(currentProject.id, nodes, edges)
    }
  }

  const handleNew = () => {
    navigate('/')
  }

  const handleLoad = () => {
    navigate('/')
  }

  if (isBuilderPage) {
    return (
      <header className="bg-zinc-900 border-b border-zinc-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-white">
              {currentProject?.name || 'ML Pipeline Builder'}
            </h1>
            {currentProject?.description && (
              <span className="text-sm text-zinc-400">{currentProject.description}</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSave}
              className="gap-2"
            >
              <Save className="w-4 h-4" />
              Save
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLoad}
              className="gap-2"
            >
              <FolderOpen className="w-4 h-4" />
              Load
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleNew}
              className="gap-2"
            >
              <FilePlus className="w-4 h-4" />
              New
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </Button>

            <div className="w-px h-6 bg-zinc-700 mx-2" />

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="bg-zinc-900 border-b border-zinc-800 px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-white">ML Pipeline Visualizer</h1>
          {user && (
            <p className="text-sm text-zinc-400 mt-1">
              Welcome back, {user.email}
            </p>
          )}
        </div>

        {user && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        )}
      </div>
    </header>
  )
}

export default Header