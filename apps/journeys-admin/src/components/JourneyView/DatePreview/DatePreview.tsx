import { ReactElement } from 'react'
import { isThisYear, parseISO, intlFormat } from 'date-fns'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import VisibilityIcon from '@mui/icons-material/Visibility'
import Skeleton from '@mui/material/Skeleton'
import { useRouter } from 'next/router'

export function DatePreview(): ReactElement {
  const { journey } = useJourney()
  const router = useRouter()

  return (
    <Stack direction="row" justifyContent="space-between">
      <>
        <Typography>
          {journey != null ? (
            intlFormat(parseISO(journey.createdAt), {
              month: 'long',
              day: 'numeric',
              year: isThisYear(parseISO(journey.createdAt))
                ? undefined
                : 'numeric'
            })
          ) : (
            <Skeleton variant="text" width="100px" />
          )}
        </Typography>
        <Button
          startIcon={<VisibilityIcon />}
          variant="outlined"
          size="small"
          color="secondary"
          disabled={journey == null}
          onClick={async () =>
            await router.push(
              journey != null ? `/api/preview?slug=${journey.slug}` : ''
            )
          }
        >
          Preview
        </Button>
      </>
    </Stack>
  )
}
