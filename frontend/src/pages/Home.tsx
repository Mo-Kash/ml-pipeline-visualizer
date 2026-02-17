import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../state/authStore'
import { useProjectStore } from '../state/projectStore'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import { Button } from '../components/ui/Button'
import { TextInput } from '../components/ui/TextInput'
import { Card } from '../components/ui/Card'
import { Modal } from '../components/ui/Modal'
import { Plus, Trash2, FolderOpen, Calendar } from 'lucide-react'

const Home = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated, login, signup } = useAuthStore()
  const { projects, loadProjects, createProject, deleteProject, setCurrentProject } = useProjectStore()

  const [isLoginMode, setIsLoginMode] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showNewProjectModal, setShowNewProjectModal] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectDescription, setNewProjectDescription] = useState('')

  useEffect(() => {
    if (isAuthenticated && user) {
      loadProjects(user.id)
    }
  }, [isAuthenticated, user, loadProjects])

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validateEmail(email)) {
      setError('Please enter a valid email address')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    const success = isLoginMode ? await login(email, password) : await signup(email, password)

    if (!success) {
      setError(isLoginMode ? 'Invalid email or password' : 'Email already exists')
    } else {
      setEmail('')
      setPassword('')
    }
  }

  const handleCreateProject = () => {
    if (!newProjectName.trim()) {
      return
    }

    if (user) {
      const project = createProject(newProjectName, newProjectDescription, user.id)
      setCurrentProject(project)
      setShowNewProjectModal(false)
      setNewProjectName('')
      setNewProjectDescription('')
      navigate(`/builder/${project.id}`)
    }
  }

  const handleOpenProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId)
    if (project) {
      setCurrentProject(project)
      navigate(`/builder/${projectId}`)
    }
  }

  const handleDeleteProject = (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (window.confirm('Are you sure you want to delete this project?')) {
      deleteProject(projectId)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-black">
        <Header />

        <main className="flex-1 flex items-center justify-center px-6 py-12">
          <Card className="w-full max-w-md p-8">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              {isLoginMode ? 'Login' : 'Sign Up'}
            </h2>

            <form onSubmit={handleAuth} className="space-y-4">
              <TextInput
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
              />

              <TextInput
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />

              {error && (
                <p className="text-red-400 text-sm">{error}</p>
              )}

              <Button type="submit" className="w-full">
                {isLoginMode ? 'Login' : 'Sign Up'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setIsLoginMode(!isLoginMode)
                  setError('')
                }}
                className="text-sm text-zinc-400 hover:text-white transition-colors"
              >
                {isLoginMode
                  ? "Don't have an account? Sign up"
                  : 'Already have an account? Login'}
              </button>
            </div>
          </Card>
        </main>

        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <Header />

      <main className="flex-1 px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-white">Your Projects</h2>
              <p className="text-zinc-400 mt-2">
                Create and manage your ML pipeline designs
              </p>
            </div>

            <Button
              onClick={() => setShowNewProjectModal(true)}
              className="gap-2"
            >
              <Plus className="w-5 h-5" />
              New Project
            </Button>
          </div>

          {projects.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="max-w-md mx-auto">
                <FolderOpen className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  No projects yet
                </h3>
                <p className="text-zinc-400 mb-6">
                  Get started by creating your first ML pipeline project
                </p>
                <Button
                  onClick={() => setShowNewProjectModal(true)}
                  className="gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Create Your First Project
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Card
                  key={project.id}
                  className="p-6 cursor-pointer hover:border-zinc-600 transition-colors group"
                  onClick={() => handleOpenProject(project.id)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white group-hover:text-zinc-200">
                      {project.name}
                    </h3>
                    <button
                      onClick={(e) => handleDeleteProject(project.id, e)}
                      className="text-zinc-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {project.description && (
                    <p className="text-sm text-zinc-400 mb-4 line-clamp-2">
                      {project.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-zinc-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(project.updatedAt)}
                    </div>
                    <div>
                      {project.nodes.length} nodes
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />

      <Modal
        open={showNewProjectModal}
        onClose={() => setShowNewProjectModal(false)}
        title="Create New Project"
      >
        <div className="space-y-4">
          <TextInput
            label="Project Name"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            placeholder="My ML Pipeline"
            required
          />

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Description (optional)
            </label>
            <textarea
              value={newProjectDescription}
              onChange={(e) => setNewProjectDescription(e.target.value)}
              placeholder="Describe your pipeline..."
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-600 resize-none"
              rows={3}
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button
              variant="ghost"
              onClick={() => setShowNewProjectModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateProject}
              disabled={!newProjectName.trim()}
            >
              Create Project
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Home