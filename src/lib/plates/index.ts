import elo from './elo'
import sparseTable from './sparse-table'
import fibTree from './fib-tree'

export type { Grid, Plate } from './types'

/** The home page rotates through these, one per visit. A new plate is one file here plus the post it points at. */
export const plates = [elo, sparseTable, fibTree]
