import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { lighten } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

import { VideoLabel } from '../../../../__generated__/globalTypes'
import { getLabelDetails } from '../../../libs/utils/getLabelDetails/getLabelDetails'

interface ContentMetadataProps {
  title: string
  description: string
  label: VideoLabel
}

export function ContentMetadata({
  title,
  description,
  label
}: ContentMetadataProps): ReactElement {
  const { label: labelText, color } = getLabelDetails(label)

  return (
    <Box
      data-testid="ChapterMetadata"
      sx={{
        zIndex: 1,
        position: 'relative'
      }}
    >
      <Stack spacing={3}>
        <Typography variant="overline2" color={color}>
          {labelText}
        </Typography>
        <Typography variant="h5">{title}</Typography>
        <Typography
          variant="body1"
          sx={{
            color: ({ palette }) => lighten(palette.text.secondary, 0.5)
          }}
        >
          <Typography
            component="span"
            variant="body1"
            sx={{ fontWeight: 'bold', color: 'common.white' }}
          >
            {description.split(' ').slice(0, 3).join(' ')}
          </Typography>
          {description.slice(
            description.split(' ').slice(0, 3).join(' ').length
          )}
        </Typography>
      </Stack>
    </Box>
  )
}
