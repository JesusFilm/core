import { gql, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import {
  GetJourney_journey as Journey,
  GetJourney_journey_blocks_ImageBlock as ImageBlock
} from '../../../../../../../../__generated__/GetJourney'
import {
  ImageBlockUpdate,
  ImageBlockUpdateVariables
} from '../../../../../../../../__generated__/ImageBlockUpdate'
import { getCustomizableImageBlocks } from '../../utils/getCustomizableImageBlocks'

import { ImageSectionItem } from './ImageSectionItem'

export const IMAGE_BLOCK_UPDATE = gql`
  mutation ImageBlockUpdate($id: ID!, $input: ImageBlockUpdateInput!) {
    imageBlockUpdate(id: $id, input: $input) {
      id
      src
      alt
      blurhash
      width
      height
      scale
      focalTop
      focalLeft
    }
  }
`

interface ImagesSectionProps {
  journey?: Journey | null
  cardBlockId: string | null
}

/**
 * Displays customizable image blocks from the selected card block.
 * Shows image previews in a grid with floating edit buttons that trigger file upload.
 */
export function ImagesSection({
  journey,
  cardBlockId
}: ImagesSectionProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [imageBlockUpdate] = useMutation<
    ImageBlockUpdate,
    ImageBlockUpdateVariables
  >(IMAGE_BLOCK_UPDATE)

  const imageBlocks = getCustomizableImageBlocks(journey, cardBlockId)

  async function handleUploadComplete(
    blockId: string,
    src: string
  ): Promise<void> {
    await imageBlockUpdate({
      variables: {
        id: blockId,
        input: { src, scale: 100, focalLeft: 50, focalTop: 50 }
      }
    })
  }

  return (
    <Box data-testid="ImagesSection" sx={{ width: '100%' }}>
      <Typography
        variant="subtitle2"
        gutterBottom
        sx={{ color: 'text.secondary', ml: 20 }}
      >
        {t('Image')}
      </Typography>
      {imageBlocks.length === 0 ? (
        <Typography variant="body2" color="text.secondary" align="center">
          {t('No customizable images found for this card.')}
        </Typography>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 2,
            width: '100%'
          }}
        >
          {imageBlocks.map((imageBlock) => (
            <ImageSectionItem
              key={imageBlock.id}
              imageBlock={imageBlock}
              onUploadComplete={handleUploadComplete}
            />
          ))}
        </Box>
      )}
    </Box>
  )
}
