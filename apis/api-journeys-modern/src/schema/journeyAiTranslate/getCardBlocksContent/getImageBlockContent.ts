import { Block } from '@core/prisma/journeys/client'
import { getImageDescription } from '@core/shared/ai/getImageDescription'

export async function getImageBlockContent({
  block,
  isCoverBlock = false
}: {
  block: Block
  isCoverBlock?: boolean
}): Promise<string> {
  const label = isCoverBlock ? 'Background Image' : 'Image'
  if (block.src != null) {
    const imageDescription = await getImageDescription({ imageUrl: block.src })
    if (imageDescription) {
      return `
## ${label}:
- Block ID: ${block.id}
- Description: ${imageDescription}\n`
    } else {
      return `
## ${label}:
- Block ID: ${block.id}
- Description: No infomation is available for this image\n`
    }
  } else {
    return `
## ${label}:
- Block ID: ${block.id}
- Description: No infomation is available for this image\n`
  }
}
