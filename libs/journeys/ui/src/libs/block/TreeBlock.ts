import type { BlockFields } from './blockFields'

export type TreeBlock<T = BlockFields> = T & {
  children: TreeBlock[]
}
