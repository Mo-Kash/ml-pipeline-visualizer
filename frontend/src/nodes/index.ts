// Export all node components
export { IngestNode } from './data/IngestNode'
export { PreprocessNode } from './data/PreprocessNode'
export { ExplorationNode } from './data/ExplorationNode'
export { FeatureEngineeringNode } from './data/FeatureEngineeringNode'
export { DataSplitNode } from './data/DataSplitNode'

export { ModelSelectionNode } from './model/ModelSelectionNode'
export { TrainingNode } from './model/TrainingNode'
export { EvaluationNode } from './model/EvaluationNode'

export { DeploymentNode } from './deployment/DeploymentNode'

// Node types mapping for ReactFlow
import { IngestNode } from './data/IngestNode'
import { PreprocessNode } from './data/PreprocessNode'
import { ExplorationNode } from './data/ExplorationNode'
import { FeatureEngineeringNode } from './data/FeatureEngineeringNode'
import { DataSplitNode } from './data/DataSplitNode'
import { ModelSelectionNode } from './model/ModelSelectionNode'
import { TrainingNode } from './model/TrainingNode'
import { EvaluationNode } from './model/EvaluationNode'
import { DeploymentNode } from './deployment/DeploymentNode'

export const nodeTypes = {
    ingestNode: IngestNode,
    preprocessNode: PreprocessNode,
    explorationNode: ExplorationNode,
    featureEngineeringNode: FeatureEngineeringNode,
    dataSplitNode: DataSplitNode,
    modelSelectionNode: ModelSelectionNode,
    trainingNode: TrainingNode,
    evaluationNode: EvaluationNode,
    deploymentNode: DeploymentNode,
}
