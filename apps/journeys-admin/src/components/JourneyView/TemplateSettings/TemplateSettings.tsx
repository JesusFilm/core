import IconButton from '@mui/material/IconButton'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement, useState } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import Edit2Icon from '@core/shared/ui/icons/Edit2'

import { TemplateSettingsDialog } from './TemplateSettingsDialog'

export function TemplateSettings(): ReactElement {
  const { journey } = useJourney()

  const [showTemplateSettingsDialog, setTemplateSettingsDialog] =
    useState(false)

  const handleTemplateSettingsOpen = (): void => {
    setTemplateSettingsDialog(true)
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

          <IconButton
            data-testid="EditTemplateSettings"
            size="small"
            onClick={handleTemplateSettingsOpen}
          >
            <Edit2Icon />
          </IconButton>
        </Stack>
        <Typography variant="body1">
          {journey != null ? (
            journey.description
          ) : (
            <Skeleton variant="text" width="80%" />
          )}
        </Typography>
      </Stack>
      <TemplateSettingsDialog
        open={showTemplateSettingsDialog}
        onClose={() => setTemplateSettingsDialog(false)}
      />
    </>
  )
}
