import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useProjectStore } from '../state/projectStore'
import { usePipelineStore } from '../state/pipelineStore'
import Header from '../components/layout/Header'
import PipelineCanvas from '../components/pipeline/PipelineCanvas'
import NodeSidebar from '../components/pipeline/NodeSidebar'
import NodeConfigPanel from '../components/pipeline/NodeConfigPanel'
import NotificationList from '../components/notifications/NotificationList'
import CodeViewPanel from '../components/code/CodeViewPanel'

const PipelineBuilder = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const { getProject, setCurrentProject, updateProject } = useProjectStore()
  const { loadPipeline, nodes, edges } = usePipelineStore()

  useEffect(() => {
    if (projectId) {
      const project = getProject(projectId)
      if (project) {
        setCurrentProject(project)
        loadPipeline(project.nodes, project.edges)
      }
    }
  }, [projectId, getProject, setCurrentProject, loadPipeline])

  // Auto-save functionality with debouncing
  useEffect(() => {
    if (!projectId) return

    const timeoutId = setTimeout(() => {
      updateProject(projectId, nodes, edges)
    }, 1000) // Save 1 second after last change

    return () => clearTimeout(timeoutId)
  }, [nodes, edges, projectId, updateProject])

  return (
    <div className="h-screen flex flex-col bg-black">
      <Header />

      <div className="flex-1 flex overflow-hidden">
        <NodeSidebar />

        <div className="flex-1 relative">
          <PipelineCanvas />
        </div>

        <NodeConfigPanel />
      </div>

      <NotificationList />
      <CodeViewPanel />
    </div>
  )
}

export default PipelineBuilder