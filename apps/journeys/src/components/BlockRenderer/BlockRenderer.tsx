import { RadioOption, RadioQuestion, Video, Step, Image } from '../blocks'
import { ReactElement } from 'react'
import { TreeBlock as BlockRendererProps } from '../../libs/transformer/transformer'

export function BlockRenderer(block: BlockRendererProps): ReactElement {
  switch (block.__typename) {
    case 'RadioOptionBlock':
      return <RadioOption {...block} />
    case 'RadioQuestionBlock':
      return <RadioQuestion {...block} />
    case 'StepBlock':
      return <Step {...block} />
    case 'VideoBlock':
      return <Video {...block} />
    case 'ImageBlock':
      return <Image {...block} />
    default:
      return <></>
  }
}

export default BlockRenderer
