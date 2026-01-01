import type { GraphNode, GraphLink } from '../types';

// ELK layout configuration and computation
export async function computeElkLayout(
  nodes: GraphNode[],
  links: GraphLink[]
): Promise<GraphNode[]> {
  // Dynamic import for SSR safety
  const ELK = await import('elkjs/lib/elk.bundled.js');
  const elk = new ELK.default();

  const NODE_WIDTH = 180;
  const NODE_HEIGHT = 80;

  // Build ELK graph structure
  const graph = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': 'RIGHT',
      'elk.spacing.nodeNode': '80',
      'elk.layered.spacing.nodeNodeBetweenLayers': '150',
      'elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX',
      'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
      'elk.edgeRouting': 'ORTHOGONAL'
    },
    children: nodes.map(node => ({
      id: node.id,
      width: NODE_WIDTH,
      height: NODE_HEIGHT
    })),
    edges: links.map((link, i) => ({
      id: `e${i}`,
      sources: [typeof link.source === 'object' ? (link.source as any).id : link.source],
      targets: [typeof link.target === 'object' ? (link.target as any).id : link.target]
    }))
  };

  // Compute layout
  const layouted = await elk.layout(graph);

  // Map positions back to nodes
  const positionMap = new Map(
    layouted.children?.map(child => [
      child.id,
      { x: child.x ?? 0, y: child.y ?? 0, width: child.width ?? NODE_WIDTH, height: child.height ?? NODE_HEIGHT }
    ]) ?? []
  );

  return nodes.map(node => ({
    ...node,
    ...positionMap.get(node.id)
  }));
}




