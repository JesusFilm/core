import { Block } from '.prisma/api-journeys-modern-client'
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
    if (imageDescription)
      return `## ${label}: \n Description: ${imageDescription}\n`
    else return `## ${label}: \n No infomation is available for this image\n`
  } else {
    return `## ${label}: \n No infomation is available for this image\n`
  }
}
