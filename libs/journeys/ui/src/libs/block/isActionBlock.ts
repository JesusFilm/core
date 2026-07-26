import {
  BlockFields_ButtonBlock as ButtonBlock,
  BlockFields_RadioOptionBlock as RadioOptionBlock,
  BlockFields_SignUpBlock as SignUpBlock,
  BlockFields_VideoBlock as VideoBlock
} from './__generated__/BlockFields'
import type { TreeBlock } from './TreeBlock'

export type ActionBlock =
  | TreeBlock<RadioOptionBlock>
  | TreeBlock<ButtonBlock>
  | TreeBlock<SignUpBlock>
  | TreeBlock<VideoBlock>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isActionBlock = (block: TreeBlock<any>): block is ActionBlock =>
  block?.action !== undefined
