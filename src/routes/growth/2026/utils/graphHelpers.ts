import type { GrowthNode, GrowthEdge, GraphNode, GraphLink } from '../types';

// Build graph data from nodes and edges
export function buildGraphData(
  nodes: GrowthNode[],
  edges: GrowthEdge[]
): { nodes: GraphNode[]; links: GraphLink[] } {
  return {
    nodes: nodes.map(n => ({ ...n })),
    links: edges.map(e => ({ source: e.source, target: e.target }))
  };
}

// Create a node map for quick lookups
export function createNodeMap(nodes: GrowthNode[]): Map<string, GrowthNode> {
  return new Map(nodes.map(n => [n.id, n]));
}

// Get prerequisite nodes for a given node
export function getPrerequisites(nodeId: string, nodeMap: Map<string, GrowthNode>): GrowthNode[] {
  const node = nodeMap.get(nodeId);
  if (!node) return [];
  
  return node.prerequisites
    .map(id => nodeMap.get(id))
    .filter((n): n is GrowthNode => n !== undefined);
}

// Filter nodes based on search query, branches, tiers, and statuses
export function filterNodes(
  nodes: GrowthNode[],
  searchQuery: string,
  selectedBranches: string[],
  selectedTiers: string[],
  selectedStatuses: string[]
): GrowthNode[] {
  return nodes.filter(node => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesTitle = node.title.toLowerCase().includes(query);
      const matchesTags = node.tags.some(tag => tag.toLowerCase().includes(query));
      if (!matchesTitle && !matchesTags) return false;
    }
    
    // Branch filter
    if (selectedBranches.length > 0 && !selectedBranches.includes(node.branch)) {
      return false;
    }
    
    // Tier filter
    if (selectedTiers.length > 0 && !selectedTiers.includes(node.tier)) {
      return false;
    }
    
    // Status filter
    if (selectedStatuses.length > 0 && !selectedStatuses.includes(node.status)) {
      return false;
    }
    
    return true;
  });
}

// Filter edges to only include those between visible nodes
export function filterEdges(
  edges: GrowthEdge[],
  visibleNodeIds: Set<string>
): GrowthEdge[] {
  return edges.filter(
    edge => visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target)
  );
}





