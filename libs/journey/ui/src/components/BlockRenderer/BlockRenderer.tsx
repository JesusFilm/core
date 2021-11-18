import {
  Button,
  // Card,
  // Image,
  // GridItem,
  // GridContainer,
  // RadioOption,
  // RadioQuestion,
  // SignUp,
  Step
  // Typography,
  // Video
} from '../'
import { ReactElement } from 'react'
import { TreeBlock as BlockRendererProps } from '../../'

export function BlockRenderer(block: BlockRendererProps): ReactElement {
  switch (block.__typename) {
    case 'ButtonBlock':
      return <Button {...block} />
    // case 'CardBlock':
    //   return <Card {...block} />
    // case 'GridItemBlock':
    //   return <GridItem {...block} />
    // case 'GridContainerBlock':
    //   return <GridContainer {...block} />
    // case 'ImageBlock':
    //   return <Image {...block} alt={block.alt} />
    // case 'RadioOptionBlock':
    //   return <RadioOption {...block} />
    // case 'RadioQuestionBlock':
    //   return <RadioQuestion {...block} />
    // case 'SignUpBlock':
    //   return <SignUp {...block} />
    case 'StepBlock':
      return <Step {...block} />
    // case 'TypographyBlock':
    //   return <Typography {...block} />
    // case 'VideoBlock':
    //   return <Video {...block} />
    default:
      return <></>
  }
}

export default BlockRenderer
