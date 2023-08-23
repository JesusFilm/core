import VisibilityIcon from '@mui/icons-material/Visibility'
import Button from '@mui/material/Button'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { intlFormat, parseISO } from 'date-fns'
import NextLink from 'next/link'
import { ReactElement } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'

export function DatePreview(): ReactElement {
  const { journey } = useJourney()

  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      sx={{ alignItems: 'center' }}
    >
      <Typography variant="overline" sx={{ color: 'secondary.light' }}>
        {journey != null ? (
          intlFormat(parseISO(journey.createdAt), {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          })
        ) : (
          <Skeleton variant="text" width="100px" />
        )}
      </Typography>
      <NextLink
        href={journey != null ? `/api/preview?slug=${journey.slug}` : ''}
        target="_blank"
        rel="noopener"
        passHref
        legacyBehavior
      >
        <Button
          startIcon={<VisibilityIcon />}
          variant="outlined"
          size="small"
          color="secondary"
          disabled={journey == null}
          style={{ borderRadius: 8 }}
        >
          Preview
        </Button>
      </NextLink>
    </Stack>
  )
}
