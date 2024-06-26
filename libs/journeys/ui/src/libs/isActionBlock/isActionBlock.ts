import { TreeBlock } from '../block'
import {
  BlockFields_ButtonBlock as ButtonBlock,
  BlockFields_FormBlock as FormBlock,
  BlockFields_RadioOptionBlock as RadioOptionBlock,
  BlockFields_SignUpBlock as SignUpBlock,
  BlockFields_VideoBlock as VideoBlock
} from '../block/__generated__/BlockFields'

export type ActionBlock =
  | TreeBlock<RadioOptionBlock>
  | TreeBlock<ButtonBlock>
  | TreeBlock<SignUpBlock>
  | TreeBlock<FormBlock>
  | TreeBlock<VideoBlock>

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const isActionBlock = (block: TreeBlock<any>): block is ActionBlock =>
  block?.action !== undefined
