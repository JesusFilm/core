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
    if (videoDescription) {
      return `
## ${label}:
- Description: ${videoDescription}
`
    } else {
      return `
## ${label}:
- Description: No description given
`
    }
  } else {
    return `
## ${label}:
- Description: No description given
`
  }
}
