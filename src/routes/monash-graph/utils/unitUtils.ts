import type { UnitRequisites, UnitGeneralInfo, Requisite } from '../types'

/**
 * Calculate the cost of a unit based on credit points and SCA band
 */
export function calculateUnitCost(creditPoints: string, band: string): string {
  const costData: Record<string, number> = {
    '4': 14630,
    '3': 11401,
    '2': 8021,
    '1': 3985
  }

  const costPer48CP = costData[band]
  if (!costPer48CP) return 'N/A'

  const totalCost = (Number(creditPoints) * costPer48CP) / 48
  return totalCost.toFixed(2)
}

/**
 * Format requisites into readable structure
 */
export function formatRequisites(requisites: UnitRequisites): {
  permission: string
  prohibitions: string[]
  corequisites: Requisite[]
  prerequisites: Requisite[]
  cpRequired: string
} {
  return {
    permission: requisites.permission,
    prohibitions: requisites.prohibitions,
    corequisites: requisites.corequisites,
    prerequisites: requisites.prerequisites,
    cpRequired: requisites.cp_required
  }
}

/**
 * Get school code from unit code
 */
export function getSchoolCode(unitCode: string): string {
  // Try 4-char prefix first, then 3-char
  return unitCode.slice(0, 4)
}

/**
 * Check if unit matches school filter
 */
export function matchesSchoolFilter(unitCode: string, schoolTags: string[]): boolean {
  if (schoolTags.length === 0) return true
  
  const code3 = unitCode.slice(0, 3)
  const code4 = unitCode.slice(0, 4)
  
  return schoolTags.includes(code3) || schoolTags.includes(code4)
}

/**
 * Get handbook URL for a unit
 */
export function getHandbookUrl(unitCode: string): string {
  return `https://handbook.monash.edu/current/units/${unitCode}`
}

