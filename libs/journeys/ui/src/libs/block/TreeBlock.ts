import { BlockFieldsFragment as BlockFields } from './__generated__/blockFields'

export type TreeBlock<T = BlockFields> = T & {
  children: TreeBlock[]
}
