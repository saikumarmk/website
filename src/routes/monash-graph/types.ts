// Type definitions for Monash unit graph

export interface UnitNode {
  id: string
  unit_name: string
  school: string
  unlocks: string[]
  requires: string[]
  x?: number
  y?: number
  z?: number
}

export interface UnitLink {
  source: string | UnitNode
  target: string | UnitNode
}

export interface Requisite {
  NumReq: number
  units: string[]
}

export interface UnitRequisites {
  permission: string
  prohibitions: string[]
  corequisites: Requisite[]
  prerequisites: Requisite[]
  cp_required: string
}

export interface UnitGeneralInfo {
  code: string
  title: string
  credit_points: string
  sca_band: string
  school: string
  academic_org: string
  requisites?: UnitRequisites
}

export interface GraphData {
  nodes: UnitNode[]
  links: UnitLink[]
  general_info: Record<string, UnitGeneralInfo>
  index_map: Record<string, number>
}

export type ViewMode = '2d' | '3d'

