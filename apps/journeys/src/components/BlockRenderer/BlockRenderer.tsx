import { RadioOption, RadioQuestion, Video, Step } from '../blocks'
import { ReactElement } from 'react'
import { TreeBlock as BlockRendererProps } from '../../libs/transformer/transformer'
import { Typography } from '../blocks/Typography'
import { Button } from '../blocks/Button'
import { Card } from '../blocks/Card'

export function BlockRenderer(block: BlockRendererProps): ReactElement {
  switch (block.__typename) {
    case 'ButtonBlock':
      return <Button {...block} />
    case 'CardBlock':
      return <Card {...block} />
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
