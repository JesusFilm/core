import { BlockFields } from './__generated__/BlockFields'

export type TreeBlock<T = BlockFields> = T & {
  children: TreeBlock[]
}
