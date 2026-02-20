# ML Pipeline Visualizer

A browser-based tool for visually designing machine learning pipelines, validating their structure, and generating executable Python code, without writing any boilerplate by hand.
Live preview: https://ml-visualizer-mokash.netlify.app/
---

## Features

**Visual Pipeline Builder**
- Drag-and-drop canvas for assembling ML workflows
- Connect nodes to define data flow between pipeline steps
- Pan, zoom, and rearrange nodes freely

**Node Library**
- Data nodes: CSV / JSON ingestion, data splitting, exploratory analysis, preprocessing, feature engineering
- Model nodes: model selection, training configuration, evaluation metrics
- Deployment nodes: model export / serving setup

**Validation**
- Real-time compatibility checks between connected nodes
- Errors and warnings displayed inline as you build
- Edge highlighting to indicate connection health (valid, warning, incompatible)

**Code Generation**
- Generates clean, executable Python code for the entire pipeline
- Imports are deduplicated and collected at the top
- Code panel updates live as you add or configure nodes

**Export**
- Download the pipeline as a Jupyter Notebook (.ipynb) [one cell per node, with import and markdown sections]

**Project Management**
- Create and name multiple projects
- Auto-save with debounce on every change
- Manual save with visual status indicator (saving / saved)

**Authentication**
- Login and signup flow with session persistence

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Build tool | Vite |
| Canvas / graph | @xyflow/react (React Flow) |
| Styling | Tailwind CSS v4 |
| State management | Zustand |
| Routing | React Router v7 |
| Image export | html-to-image |
| Icons | Lucide React |

---

## Getting Started

**Prerequisites:** Node.js 18 or later.

```bash
# Install dependencies
cd frontend
npm install

# Start the development server
npm run dev
```

The app will locally be available at `http://localhost:5173`.

```bash
# Type-check the project
npx tsc --noEmit

# Build for production
npm run build
```

---

## How to Use

1. **Sign up or log in** on the landing page.
2. **Create a new project** by giving it a name and optional description.
3. **Drag nodes** from the left sidebar onto the canvas.
4. **Connect nodes** by dragging from one node's output handle to another's input handle. The edge color indicates whether the connection is valid.
5. **Configure a node** on clicking it, a panel opens on the right where you can set parameters specific to that step.
6. **View the generated code** using the code panel at the bottom. It updates as you build.
7. **Export** using the Export button in the header:
   - *Jupyter Notebook* — downloads a `.ipynb` file with one cell per pipeline step.
8. **Save** manually with the Save button, or rely on auto-save (triggers one second after any change).
