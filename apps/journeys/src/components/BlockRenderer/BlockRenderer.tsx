import {
  Button,
  Card,
  Image,
  RadioOption,
  RadioQuestion,
  Step,
  Typography,
  Video
} from '../blocks'
import { ReactElement } from 'react'
import { TreeBlock as BlockRendererProps } from '../../libs/transformer/transformer'

export function BlockRenderer(block: BlockRendererProps): ReactElement {
  switch (block.__typename) {
    case 'CardBlock':
      return <Card {...block} />
    case 'ImageBlock':
      return <Image {...block} alt={block.alt} />
    case 'RadioOptionBlock':
      return <RadioOption {...block} />
    case 'RadioQuestionBlock':
      return <RadioQuestion {...block} />
    case 'StepBlock':
      return <Step {...block} />
    case 'TypographyBlock':
      return <Typography {...block} />
    case 'VideoBlock':
      return <Video {...block} />
    default:
      return <></>
  }
}

export default BlockRenderer
