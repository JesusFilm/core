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
      blocks,
      block: coverBlock,
      isCoverBlock: true
    })
  } else if (coverBlock.typename === 'VideoBlock') {
    const videoCoverBlock = blocks.find(
      (block) => block.id === coverBlock.posterBlockId
    )
    if (videoCoverBlock && videoCoverBlock.src != null) {
      const videoDescription = await getImageDescription({
        imageUrl: videoCoverBlock.src
      })
      if (videoDescription)
        return `## Background Video: \n ${videoDescription}\n`
      else
        return `## Background Video: \n No infomation is available for this video\n`
    } else {
      return `## Background Video: \n No infomation is available for this video\n`
    }
  }
  return ''
}
