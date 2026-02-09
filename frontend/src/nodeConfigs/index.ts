// Export all node configurations
export { ingestConfig } from './data/ingestConfig'
export { preprocessConfig } from './data/preprocessConfig'
export { explorationConfig } from './data/explorationConfig'
export { featureEngineeringConfig } from './data/featureEngineeringConfig'
export { dataSplitConfig } from './data/dataSplitConfig'

export { modelSelectionConfig } from './model/modelSelectionConfig'
export { trainingConfig } from './model/trainingConfig'
export { evaluationConfig } from './model/evaluationConfig'

export { deploymentConfig } from './deployment/deploymentConfig'

import { ingestConfig } from './data/ingestConfig'
import { preprocessConfig } from './data/preprocessConfig'
import { explorationConfig } from './data/explorationConfig'
import { featureEngineeringConfig } from './data/featureEngineeringConfig'
import { dataSplitConfig } from './data/dataSplitConfig'
import { modelSelectionConfig } from './model/modelSelectionConfig'
import { trainingConfig } from './model/trainingConfig'
import { evaluationConfig } from './model/evaluationConfig'
import { deploymentConfig } from './deployment/deploymentConfig'
import { type NodeConfig } from '../types/nodeTypes'

export const allNodeConfigs: Record<string, NodeConfig> = {
    ingestNode: ingestConfig,
    preprocessNode: preprocessConfig,
    explorationNode: explorationConfig,
    featureEngineeringNode: featureEngineeringConfig,
    dataSplitNode: dataSplitConfig,
    modelSelectionNode: modelSelectionConfig,
    trainingNode: trainingConfig,
    evaluationNode: evaluationConfig,
    deploymentNode: deploymentConfig,
}

export function getNodeConfig(nodeType: string): NodeConfig | undefined {
    return allNodeConfigs[nodeType]
}
