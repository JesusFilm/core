import { Block } from '.prisma/api-journeys-modern-client'

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
  let result = ''
  switch (block.typename) {
    case 'ImageBlock':
      return await getImageBlockContent({
        blocks,
        block
      })
    case 'VideoBlock':
      return await getVideoBlockContent({
        blocks,
        block
      })
    case 'TypographyBlock':
      result += `## Text: \n ${block.content}\n`
      break
    case 'ButtonBlock':
      return getButtonBlockContent({
        blocks,
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
      break
  }
  return result
}
