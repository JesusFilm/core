import { RadioOption, RadioQuestion, Video, Step } from '../blocks'
import { BlockType } from '../../types'
import { ReactElement } from 'react'

export function BlockRenderer (block: BlockType): ReactElement | null {
  switch (block.__typename) {
    case 'RadioOption':
      return <RadioOption {...block} />
    case 'RadioQuestion':
      return <RadioQuestion {...block} />
    case 'Step':
      return <Step {...block} />
    case 'Video':
      return <Video />
    default:
      return null
  }
}

export default BlockRenderer
