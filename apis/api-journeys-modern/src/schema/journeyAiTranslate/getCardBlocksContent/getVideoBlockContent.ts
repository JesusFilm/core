import { Block } from '@core/prisma/journeys/client'
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
  const label = isCoverBlock ? 'Background Video' : 'Video'
  const videoCoverBlock = blocks.find(
    (childBlock) => childBlock.id === block.posterBlockId
  )
  if (videoCoverBlock && videoCoverBlock.src != null) {
    let videoDescription
    try {
      videoDescription = await getImageDescription({
        imageUrl: videoCoverBlock.src
      })
    } catch (error) {
      console.error('Failed to get video image description:', error)
      videoDescription = null
    }
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
