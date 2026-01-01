import type { GrowthStatus, GrowthTier, GrowthNode } from '../types';

// Status badge styling
export function getStatusBadgeClass(status: GrowthStatus): string {
  const base = 'badge badge-sm font-bold';
  switch (status) {
    case 'locked':
      return `${base} badge-ghost opacity-50`;
    case 'available':
      return `${base} badge-primary`;
    case 'in_progress':
      return `${base} badge-warning`;
    case 'complete':
      return `${base} badge-success`;
  }
}

// Tier labels
export const TIER_LABELS: Record<GrowthTier, string> = {
  roots: 'RT',
  trunk: 'TK',
  branch: 'BR',
  crown: 'CR'
};

// Branch colors for visual distinction
export function getBranchColor(branch: string): string {
  const colors: Record<string, string> = {
    'systems-hpc': '#9333ea', // purple
    'gen-media': '#ec4899', // pink
    'rl': '#3b82f6', // blue
    'maths': '#10b981', // green
    'swe': '#f59e0b', // amber
    'physics': '#06b6d4' // cyan
  };
  return colors[branch] || '#6b7280';
}

// Artifact type icons
export function getArtifactIcon(type: string): string {
  const icons: Record<string, string> = {
    repo: '📦',
    blog: '📝',
    notebook: '📓',
    demo: '🎮'
  };
  return icons[type] || '🔗';
}

// Pokemon mapping for branches
export const BRANCH_POKEMON: Record<string, { name: string }> = {
  'systems-hpc': { name: 'porygon-z' },
  'gen-media': { name: 'smeargle' },
  'rl': { name: 'alakazam' },
  'maths': { name: 'metagross' },
  'swe': { name: 'rotom' },
  'physics': { name: 'magnezone' }
};

// Compute derived statuses based on prerequisites
export function computeDerivedStatuses(nodes: GrowthNode[]): GrowthNode[] {
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  
  return nodes.map(node => {
    // If manually set to in_progress or complete, keep it
    if (node.status === 'in_progress' || node.status === 'complete') {
      return node;
    }
    
    // Check if all prerequisites are complete
    const allPrereqsComplete = node.prerequisites.every(prereqId => {
      const prereq = nodeMap.get(prereqId);
      return prereq?.status === 'complete';
    });
    
    return {
      ...node,
      status: allPrereqsComplete ? 'available' : 'locked'
    };
  });
}



