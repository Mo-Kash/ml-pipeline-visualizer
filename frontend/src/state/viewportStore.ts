/**
 * Thin store that exposes React Flow's viewport utilities (fitView, getViewport,
 * setViewport) to components that live outside the ReactFlow provider tree, such
 * as the Header.
 *
 * PipelineCanvas registers the callbacks via `registerViewportControls` once
 * React Flow has mounted. Header reads them when it needs to export an image.
 */
import { create } from 'zustand'
import type { Viewport } from '@xyflow/react'

interface FitViewOptions {
    padding?: number
    duration?: number
}

interface ViewportStore {
    fitView: ((opts?: FitViewOptions) => void) | null
    getViewport: (() => Viewport) | null
    setViewport: ((vp: Viewport, opts?: { duration?: number }) => void) | null
    registerViewportControls: (
        fitView: (opts?: FitViewOptions) => void,
        getViewport: () => Viewport,
        setViewport: (vp: Viewport, opts?: { duration?: number }) => void
    ) => void
}

export const useViewportStore = create<ViewportStore>((set) => ({
    fitView: null,
    getViewport: null,
    setViewport: null,
    registerViewportControls: (fitView, getViewport, setViewport) =>
        set({ fitView, getViewport, setViewport }),
}))
