import type { UnitNode, GraphData } from '../types'
import { matchesSchoolFilter } from './unitUtils'

/**
 * Get highlighted nodes based on selected node and display settings
 */
export function getHighlightedNodes(
  node: UnitNode | null,
  graphData: GraphData,
  showUnlocks: boolean,
  showRequirements: boolean
): Set<UnitNode> {
  const highlighted = new Set<UnitNode>()
  
  if (!node) return highlighted
  
  highlighted.add(node)
  
  if (showUnlocks) {
    node.unlocks.forEach(neighborId => {
      const neighborNode = graphData.nodes[graphData.index_map[neighborId]]
      if (neighborNode) highlighted.add(neighborNode)
    })
  }
  
  if (showRequirements) {
    node.requires.forEach(neighborId => {
      const neighborNode = graphData.nodes[graphData.index_map[neighborId]]
      if (neighborNode) highlighted.add(neighborNode)
    })
  }
  
  return highlighted
}

/**
 * Filter graph data based on filters
 */
export function filterGraphData(
  graphData: GraphData,
  schoolTags: string[],
  unitCodes: string[]
): GraphData {
  // Unit codes filter (highest priority)
  if (unitCodes.length > 0) {
    const filteredNodes = graphData.nodes.filter(node => unitCodes.includes(node.id))
    const filteredLinks = graphData.links.filter(link => {
      const sourceId = typeof link.source === 'string' ? link.source : link.source.id
      const targetId = typeof link.target === 'string' ? link.target : link.target.id
      return unitCodes.includes(sourceId) && unitCodes.includes(targetId)
    })
    
    return {
      ...graphData,
      nodes: filteredNodes,
      links: filteredLinks
    }
  }
  
  // School tags filter
  if (schoolTags.length > 0) {
    const filteredNodes = graphData.nodes.filter(node => 
      matchesSchoolFilter(node.id, schoolTags)
    )
    const filteredLinks = graphData.links.filter(link => {
      const sourceId = typeof link.source === 'string' ? link.source : link.source.id
      const targetId = typeof link.target === 'string' ? link.target : link.target.id
      return matchesSchoolFilter(sourceId, schoolTags) && matchesSchoolFilter(targetId, schoolTags)
    })
    
    return {
      ...graphData,
      nodes: filteredNodes,
      links: filteredLinks
    }
  }
  
  // No filters - return all data
  return graphData
}

/**
 * Search for a node by ID
 */
export function findNodeById(graphData: GraphData, searchQuery: string): UnitNode | null {
  const upperQuery = searchQuery.toUpperCase().trim()
  return graphData.nodes.find(n => n.id.toUpperCase() === upperQuery) || null
}

