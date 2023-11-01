import IconButton from '@mui/material/IconButton'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement, useState } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import Edit2Icon from '@core/shared/ui/icons/Edit2'

import { TemplateSettingsDialog } from './TemplateSettingsDialog'
import { TemplateSettingsForm } from './TemplateSettingsForm/TemplateSettingsForm'

interface TemplateSettingsProps {
  isPublisher?: boolean
}

export function TemplateSettings({
  isPublisher = false
}: TemplateSettingsProps): ReactElement {
  const { journey } = useJourney()

  const [open, setOpen] = useState(false)

  function handleOpen(): void {
    setOpen(true)
  }

  function handleClose(): void {
    setOpen(false)
  }

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
          {isPublisher && (
            <IconButton
              data-testid="EditTemplateSettings"
              size="small"
              onClick={handleOpen}
            >
              <Edit2Icon />
            </IconButton>
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
      {journey != null && (
        <TemplateSettingsForm onSubmit={handleClose}>
          <TemplateSettingsDialog open={open} onClose={handleClose} />
        </TemplateSettingsForm>
      )}
    </>
  )
}
