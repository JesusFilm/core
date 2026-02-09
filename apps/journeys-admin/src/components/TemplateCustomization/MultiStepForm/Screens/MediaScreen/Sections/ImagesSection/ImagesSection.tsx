import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

import { GetJourney_journey as Journey } from '../../../../../../../__generated__/GetJourney'
import { getCardImageBlocks } from '../../utils/getJourneyMedia'

interface ImagesSectionProps {
  journey?: Journey
  cardBlockId: string | null
}

/**
 * Displays customizable image blocks from the selected card block.
 * Shows a list of images that belong to the specified card.
 */
export function ImagesSection({
  journey,
  cardBlockId
}: ImagesSectionProps): ReactElement {
  const imageBlocks = getCardImageBlocks(journey, cardBlockId)

  return (
    <Box data-testid="ImagesSection">
      <Typography variant="h6" gutterBottom>
        Images
      </Typography>
      {imageBlocks.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No customizable images found for this card.
        </Typography>
      ) : (
        <Stack spacing={2}>
          {imageBlocks.map((imageBlock) => (
            <Box key={imageBlock.id}>
              <Typography variant="body2" fontWeight="medium">
                Image ID: {imageBlock.id}
              </Typography>
              {imageBlock.alt && (
                <Typography variant="body2" color="text.secondary">
                  Alt: {imageBlock.alt}
                </Typography>
              )}
              {imageBlock.src && (
                <Typography variant="body2" color="text.secondary">
                  Source: {imageBlock.src}
                </Typography>
              )}
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  )
}
