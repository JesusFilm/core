import IconButton from '@mui/material/IconButton'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import NextLink from 'next/link'
import { ReactElement } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import Edit2Icon from '@core/shared/ui/icons/Edit2'

interface TemplateSettingsProps {
  isPublisher?: boolean
}

export function TemplateSettings({
  isPublisher = false
}: TemplateSettingsProps): ReactElement {
  const { journey } = useJourney()

  return (
    <>
      <Stack direction="column" spacing={2}>
        <Stack
          direction="row"
          sx={{
            justifyContent: 'space-between',
            display: journey != null ? 'flex' : 'block'
          }}
        >
          <Typography variant="h4">
            {journey != null ? (
              journey.title
            ) : (
              <Skeleton variant="text" width="60%" />
            )}
          </Typography>
          {journey != null && isPublisher && (
            <NextLink
              href={`/publisher/${journey.id}/edit`}
              passHref
              legacyBehavior
            >
              <IconButton size="small" aria-label="Edit">
                <Edit2Icon />
              </IconButton>
            </NextLink>
          )}
        </Stack>
        <Typography variant="body1">
          {journey != null ? (
            journey.description
          ) : (
            <Skeleton variant="text" width="80%" />
          )}
        </Typography>
      </Stack>
    </>
  )
}
