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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isActionBlock = (block: TreeBlock<any>): block is ActionBlock => {
  console.log({ block, logic: block?.action !== undefined })
  return block?.action !== undefined
}
