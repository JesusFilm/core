import { Block } from '.prisma/api-journeys-modern-client'
import { getImageDescription } from '@core/shared/ai/getImageDescription'

import { getImageBlockContent } from './getImageBlockContent'

export async function getCoverBlockContent({
  blocks,
  coverBlock
}: {
  blocks: Block[]
  coverBlock: Block
}): Promise<string> {
  if (coverBlock.typename === 'ImageBlock' && coverBlock.src != null) {
    return await getImageBlockContent({
      block: coverBlock,
      isCoverBlock: true
    })
  } else if (coverBlock.typename === 'VideoBlock') {
    const videoCoverBlock = blocks.find(
      (block) => block.id === coverBlock.posterBlockId
    )
    if (videoCoverBlock && videoCoverBlock.src != null) {
      let videoDescription
      try {
        videoDescription = await getImageDescription({
          imageUrl: videoCoverBlock.src
        })
      } catch (_error) {
        videoDescription = null
      }
      if (videoDescription) {
        return `
## Background Video:
- Description: ${videoDescription}
`
      } else {
        return `
## Background Video:
- Description: No description given
`
      }
    } else {
      return `
## Background Video:
- Description: No description given
`
    }
  }
  return ''
}
