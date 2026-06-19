import { Block } from '@core/prisma/journeys/client'

import { getButtonBlockContent } from './getButtonBlockContent'
import { getImageBlockContent } from './getImageBlockContent'
import { getRadioQuestionBlockContent } from './getRadioQuestionBlockContent'
import { getVideoBlockContent } from './getVideoBlockContent'

export async function getBlockContent({
  blocks,
  block
}: {
  blocks: Block[]
  block: Block
}) {
  switch (block.typename) {
    case 'ImageBlock':
      return await getImageBlockContent({
        block
      })
    case 'VideoBlock':
      return await getVideoBlockContent({
        blocks,
        block
      })
    case 'TypographyBlock':
      return `## Text: \n ${block.content}\n`
    case 'ButtonBlock':
      return getButtonBlockContent({
        block
      })
    case 'RadioQuestionBlock':
      return getRadioQuestionBlockContent({
        blocks,
        block
      })
    case 'SpacerBlock':
      return '### Blank Space\n'
    default:
      return ''
  }
}
