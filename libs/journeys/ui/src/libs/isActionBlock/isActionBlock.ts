import { TreeBlock } from '../block'
import {
  BlockFields_ButtonBlock as ButtonBlock,
  BlockFields_FormBlock as FormBlock,
  BlockFields_RadioOptionBlock as RadioOptionBlock,
  BlockFields_SignUpBlock as SignUpBlock,
  BlockFields_TextResponseBlock as TextResponseBlock,
  BlockFields_VideoBlock as VideoBlock
} from '../block/__generated__/BlockFields'

export type ActionBlock =
  | TreeBlock<RadioOptionBlock>
  | TreeBlock<ButtonBlock>
  | TreeBlock<TextResponseBlock>
  | TreeBlock<SignUpBlock>
  | TreeBlock<FormBlock>
  | TreeBlock<VideoBlock>

export const isActionBlock = (block: TreeBlock<any>): block is ActionBlock =>
  block?.action !== undefined
