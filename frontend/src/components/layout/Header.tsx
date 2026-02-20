import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../state/authStore'
import { useProjectStore } from '../../state/projectStore'
import { usePipelineStore } from '../../state/pipelineStore'
import { useNotificationStore } from '../../state/notificationStore'
import { Button } from '../ui/Button'
import {
  LogOut, Save, FolderOpen, FilePlus, Download,
  FileImage, Notebook, Trash2, CheckCircle2, Loader2, ChevronDown,
} from 'lucide-react'
import { exportToImage, exportToNotebook } from '../../services/export/exportService'
import { generatePipelineCode } from '../../services/codegen/generator'

type SaveStatus = 'saved' | 'saving' | 'idle'

const Header = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const currentProject = useProjectStore((state) => state.currentProject)
  const updateProject = useProjectStore((state) => state.updateProject)
  const nodes = usePipelineStore((state) => state.nodes)
  const edges = usePipelineStore((state) => state.edges)
  const clearPipeline = usePipelineStore((state) => state.clearPipeline)
  const { addNotification } = useNotificationStore()

  const [showExportMenu, setShowExportMenu] = useState(false)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const exportMenuRef = useRef<HTMLDivElement>(null)

  const isBuilderPage = location.pathname.startsWith('/builder')

  // Close export menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setShowExportMenu(false)
      }
    }
    if (showExportMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showExportMenu])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleSave = useCallback(() => {
    if (currentProject) {
      setSaveStatus('saving')
      updateProject(currentProject.id, nodes, edges)
      setTimeout(() => {
        setSaveStatus('saved')
        setTimeout(() => setSaveStatus('idle'), 2000)
      }, 600)
    }
  }, [currentProject, nodes, edges, updateProject])

  const handleNew = () => navigate('/')
  const handleLoad = () => navigate('/')

  const handleClear = () => {
    clearPipeline()
    addNotification({
      type: 'success',
      message: 'Pipeline cleared',
      dismissible: true,
      duration: 2000,
    })
  }

  const handleExportImage = async (format: 'png' | 'svg') => {
    setShowExportMenu(false)
    try {
      await exportToImage(nodes, {
        format,
        filename: `${currentProject?.name || 'pipeline'}.${format}`,
      })
      addNotification({
        type: 'success',
        message: `Exported as ${format.toUpperCase()}`,
        dismissible: true,
        duration: 2000,
      })
    } catch {
      addNotification({
        type: 'error',
        message: 'Failed to export image. Make sure the canvas has nodes.',
        dismissible: true,
        duration: 4000,
      })
    }
  }

  const handleExportNotebook = () => {
    setShowExportMenu(false)
    const generatedCode = generatePipelineCode(nodes, edges)
    exportToNotebook(nodes, generatedCode.fullCode, currentProject?.name || 'ML Pipeline')
    addNotification({
      type: 'success',
      message: 'Exported as Jupyter Notebook',
      dismissible: true,
      duration: 2000,
    })
  }

  if (isBuilderPage) {
    return (
      <header className="bg-zinc-900 border-b border-zinc-800 px-6 py-3 z-10">
        <div className="flex items-center justify-between">
          {/* Left: project name */}
          <div className="flex items-center gap-3">
            <span className="text-lg font-semibold text-white">
              {currentProject?.name || 'ML Pipeline Builder'}
            </span>
            {currentProject?.description && (
              <span className="text-sm text-zinc-500 hidden md:block">
                {currentProject.description}
              </span>
            )}
          </div>

          {/* Right: toolbar */}
          <div className="flex items-center gap-1">
            {/* Save button with status */}
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" onClick={handleSave} className="gap-2">
                {saveStatus === 'saving' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : saveStatus === 'saved' ? (
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saveStatus === 'saving' ? 'Saving…' : saveStatus === 'saved' ? 'Saved' : 'Save'}
              </Button>
            </div>

            <Button variant="ghost" size="sm" onClick={handleLoad} className="gap-2">
              <FolderOpen className="w-4 h-4" />
              Load
            </Button>

            <Button variant="ghost" size="sm" onClick={handleNew} className="gap-2">
              <FilePlus className="w-4 h-4" />
              New
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="gap-2 text-red-400 hover:text-red-300"
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </Button>

            <div className="w-px h-5 bg-zinc-700 mx-1" />

            {/* Export button with dropdown */}
            <div className="relative" ref={exportMenuRef}>
              <Button
                variant="default"
                size="sm"
                onClick={() => setShowExportMenu((prev) => !prev)}
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                Export
                <ChevronDown
                  className={`w-3 h-3 transition-transform ${showExportMenu ? 'rotate-180' : ''}`}
                />
              </Button>

              {showExportMenu && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden z-50">
                  <div className="px-3 py-2 border-b border-zinc-800">
                    <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">
                      Export As
                    </p>
                  </div>

                  <button
                    onClick={() => handleExportImage('png')}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                  >
                    <FileImage className="w-4 h-4 text-blue-400" />
                    <div className="text-left">
                      <div className="font-medium">PNG Image</div>
                      <div className="text-xs text-zinc-500">High quality raster image</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleExportImage('svg')}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                  >
                    <FileImage className="w-4 h-4 text-purple-400" />
                    <div className="text-left">
                      <div className="font-medium">SVG Vector</div>
                      <div className="text-xs text-zinc-500">Scalable vector graphic</div>
                    </div>
                  </button>

                  <button
                    onClick={handleExportNotebook}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors border-t border-zinc-800"
                  >
                    <Notebook className="w-4 h-4 text-orange-400" />
                    <div className="text-left">
                      <div className="font-medium">Jupyter Notebook</div>
                      <div className="text-xs text-zinc-500">Download as .ipynb</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            <div className="w-px h-5 bg-zinc-700 mx-1" />

            <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
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
          <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        )}
      </div>
    </header>
  )
}

export default Header