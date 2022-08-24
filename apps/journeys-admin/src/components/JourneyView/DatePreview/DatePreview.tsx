import { ReactElement } from 'react'
import { isThisYear, parseISO, intlFormat } from 'date-fns'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import VisibilityIcon from '@mui/icons-material/Visibility'
import { useRouter } from 'next/router'

export function DatePreview(): ReactElement {
  const { journey } = useJourney()
  const router = useRouter()

  return (
    <Stack direction="row" justifyContent="space-between">
      {journey != null && (
        <>
          <Typography>
            {/* what date should we be rendering */}
            {intlFormat(parseISO(journey.createdAt), {
              month: 'long',
              day: 'numeric',
              year: isThisYear(parseISO(journey.createdAt))
                ? undefined
                : 'numeric'
            })}
          </Typography>
          <Button
            startIcon={<VisibilityIcon />}
            variant="outlined"
            size="small"
            color="secondary"
            onClick={async () =>
              await router.push(`/api/preview?slug=${journey.slug}`)
            }
          >
            Preview
          </Button>
        </>
      )}
    </Stack>
  )
}
