import { create } from 'zustand'
import { type Node, type Edge } from '@xyflow/react'

export interface Project {
    id: string
    name: string
    description?: string
    createdAt: string
    updatedAt: string
    nodes: Node[]
    edges: Edge[]
    userId: string
}

interface ProjectState {
    projects: Project[]
    currentProject: Project | null

    // Actions
    loadProjects: (userId: string) => void
    createProject: (name: string, description: string, userId: string) => Project
    updateProject: (projectId: string, nodes: Node[], edges: Edge[]) => void
    deleteProject: (projectId: string) => void
    setCurrentProject: (project: Project | null) => void
    getProject: (projectId: string) => Project | undefined
}

export const useProjectStore = create<ProjectState>((set, get) => ({
    projects: [],
    currentProject: null,

    loadProjects: (userId) => {
        const allProjects = JSON.parse(localStorage.getItem('ml-viz-projects') || '[]')
        const userProjects = allProjects.filter((p: Project) => p.userId === userId)
        set({ projects: userProjects })
    },

    createProject: (name, description, userId) => {
        const newProject: Project = {
            id: Date.now().toString(),
            name,
            description,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            nodes: [],
            edges: [],
            userId,
        }

        const allProjects = JSON.parse(localStorage.getItem('ml-viz-projects') || '[]')
        allProjects.push(newProject)
        localStorage.setItem('ml-viz-projects', JSON.stringify(allProjects))

        set({
            projects: [...get().projects, newProject],
            currentProject: newProject,
        })

        return newProject
    },

    updateProject: (projectId, nodes, edges) => {
        const allProjects = JSON.parse(localStorage.getItem('ml-viz-projects') || '[]')
        const projectIndex = allProjects.findIndex((p: Project) => p.id === projectId)

        if (projectIndex !== -1) {
            allProjects[projectIndex] = {
                ...allProjects[projectIndex],
                nodes,
                edges,
                updatedAt: new Date().toISOString(),
            }
            localStorage.setItem('ml-viz-projects', JSON.stringify(allProjects))

            set({
                projects: get().projects.map((p) =>
                    p.id === projectId
                        ? { ...p, nodes, edges, updatedAt: new Date().toISOString() }
                        : p
                ),
                currentProject:
                    get().currentProject?.id === projectId
                        ? { ...get().currentProject!, nodes, edges, updatedAt: new Date().toISOString() }
                        : get().currentProject,
            })
        }
    },

    deleteProject: (projectId) => {
        const allProjects = JSON.parse(localStorage.getItem('ml-viz-projects') || '[]')
        const filtered = allProjects.filter((p: Project) => p.id !== projectId)
        localStorage.setItem('ml-viz-projects', JSON.stringify(filtered))

        set({
            projects: get().projects.filter((p) => p.id !== projectId),
            currentProject: get().currentProject?.id === projectId ? null : get().currentProject,
        })
    },

    setCurrentProject: (project) => {
        set({ currentProject: project })
    },

    getProject: (projectId) => {
        return get().projects.find((p) => p.id === projectId)
    },
}))
