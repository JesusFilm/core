import { Block } from '.prisma/api-journeys-modern-client'
import { getImageDescription } from '@core/shared/ai/getImageDescription'

export async function getVideoBlockContent({
  blocks,
  block,
  isCoverBlock = false
}: {
  blocks: Block[]
  block: Block
  isCoverBlock?: boolean
}): Promise<string> {
  const label = isCoverBlock ? 'Video' : 'Background Video'
  const videoCoverBlock = blocks.find(
    (childBlock) => childBlock.id === block.posterBlockId
  )
  if (videoCoverBlock && videoCoverBlock.src != null) {
    const videoDescription = await getImageDescription({
      imageUrl: videoCoverBlock.src
    })
    if (videoDescription)
      return `## ${label}: \n Description: ${videoDescription}\n`
    else return `## ${label}: \n No infomation is available for this video\n`
  } else {
    return `## ${label}: \n No infomation is available for this video\n`
  }
}
