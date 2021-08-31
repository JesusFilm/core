import { RadioOption, RadioQuestion, Video } from '../blocks'
import { BlockType } from '../../types'
import { ReactElement } from 'react'

export function BlockRenderer (block: BlockType): ReactElement | null {
  return BlockSwitcher(block, 1000)
}

export const BlockSwitcher = (
  block: BlockType,
  key: number
): ReactElement | null => {
  switch (block.__typename) {
    case 'Video':
      return <Video {...block} key={key} />
    case 'RadioOption':
      return <RadioOption {...block} key={key} />
    case 'RadioQuestion':
      return <RadioQuestion {...block} key={key} />
    default:
      return null
  }
}

export default BlockRenderer
