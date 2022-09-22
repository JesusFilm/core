import { ReactElement } from 'react'
import { parseISO, intlFormat } from 'date-fns'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import VisibilityIcon from '@mui/icons-material/Visibility'
import Skeleton from '@mui/material/Skeleton'
import NextLink from 'next/link'

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
        passHref
      >
        <Button
          startIcon={<VisibilityIcon />}
          variant="outlined"
          size="small"
          color="secondary"
          target="_blank"
          rel="noopener"
          component="a"
          disabled={journey == null}
          style={{ borderRadius: 8 }}
        >
          Preview
        </Button>
      </NextLink>
    </Stack>
  )
}
