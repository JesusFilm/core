import { TreeBlock } from '../block'
import {
  BlockFields_ButtonBlock_Fragment as ButtonBlock,
  BlockFields_RadioOptionBlock_Fragment as RadioOptionBlock,
  BlockFields_SignUpBlock_Fragment as SignUpBlock,
  BlockFields_VideoBlock_Fragment as VideoBlock
} from '../block/__generated__/blockFields'

export type ActionBlock =
  | TreeBlock<RadioOptionBlock>
  | TreeBlock<ButtonBlock>
  | TreeBlock<SignUpBlock>
  | TreeBlock<VideoBlock>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isActionBlock = (block: TreeBlock<any>): block is ActionBlock =>
  block?.action !== undefined
