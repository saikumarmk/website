// Type definitions for Yggdrasil Growth Tree 2026

export type GrowthTier = 'roots' | 'trunk' | 'branch' | 'crown';

export type GrowthStatus = 'locked' | 'available' | 'in_progress' | 'complete';

export interface GrowthNode {
    id: string;
    title: string;
    branch: string;
    tier: GrowthTier;
    prerequisites: string[];
    status: GrowthStatus;
    estimate_hours: number;
    tags: string[];
    artifact: {
        type: 'repo' | 'blog' | 'notebook' | 'demo';
        url: string;
    };
    page_path: string;
}

export interface GrowthEdge {
    source: string;
    target: string;
}

export interface GrowthData {
    year: number;
    branches: string[];
    nodes: GrowthNode[];
    edges: GrowthEdge[];
}

// Graph visualization types (ELK-compatible)
export interface GraphNode extends GrowthNode {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
}

export interface GraphLink {
    source: string;
    target: string;
}



