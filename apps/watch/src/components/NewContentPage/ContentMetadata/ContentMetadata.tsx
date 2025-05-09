import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { lighten } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

import { VideoLabel } from '../../../../__generated__/globalTypes'
import { SimpleQuizButton } from '../../../components/Quiz'
import { getLabelDetails } from '../../../libs/utils/getLabelDetails/getLabelDetails'

interface ContentMetadataProps {
  title: string
  description: string
  label: VideoLabel
  contentId: string
}

export function ContentMetadata({
  title,
  description,
  label,
  contentId
}: ContentMetadataProps): ReactElement {
  const { label: labelText, color } = getLabelDetails(label)

  return (
    <Box
      data-testid="ChapterMetadata"
      sx={{
        zIndex: 1,
        position: 'relative',
        width: { xl: '60%' },
        px: { xs: 4, sm: 6, md: 8, lg: 10, xl: 12 }
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
        <SimpleQuizButton buttonText="Take the Quiz" contentId={contentId} />
      </Stack>
    </Box>
  )
}
