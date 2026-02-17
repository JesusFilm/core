import { gql, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import {
  GetJourney_journey_blocks_ImageBlock as ImageBlock,
  GetJourney_journey as Journey
} from '../../../../../../../../__generated__/GetJourney'
import {
  MediaScreenImageBlockUpdate,
  MediaScreenImageBlockUpdateVariables
} from '../../../../../../../../__generated__/MediaScreenImageBlockUpdate'
import { getCustomizableImageBlocks } from '../../utils'

import { ImageSectionItem } from './ImageSectionItem'

export const IMAGE_BLOCK_UPDATE = gql`
  mutation MediaScreenImageBlockUpdate(
    $id: ID!
    $input: ImageBlockUpdateInput!
  ) {
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
    MediaScreenImageBlockUpdate,
    MediaScreenImageBlockUpdateVariables
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
    <Stack
      data-testid="ImagesSection"
      gap={2}
      sx={{ width: '100%', alignSelf: 'flex-start' }}
    >
      <Typography
        variant="subtitle2"
        gutterBottom
        sx={{ color: 'text.secondary' }}
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
    </Stack>
  )
}
